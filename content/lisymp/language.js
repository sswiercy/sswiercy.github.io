const language = {
	
	Location: function (source, begin, end) {
		this.source = source;
		this.begin = begin;
		this.end = end;
	},
	
	Expression: function (fun, location) {
		this.fun = fun;
		this.location = location;
	},
	
	Usage: function (symbol, location) {
		this.symbol = symbol;
		this.location = location;
	},
	
	Symbol: function (name, expr, location) {
		this.name = name;
		this.expr = expr;
		this.location = location;
		this.usages = [];
	},
	
	Exception: function (message, location) {
		this.message = message;
		this.location = location;
		this.stackTrace = [];
	},
	
	Call: function (symbol, argument, location) {
		this.symbol = symbol;
		this.argument = argument;
		this.location = location;
	},
	
	CallDepth: function () {
		this.depth = 0;
		this.limit = Number.POSITIVE_INFINITY;
	},
	
	Collector: function () {
		this.symbols = {};
	}
};

language.Location.prototype.merge = function (location) {
	return new language.Location(this.source, this.begin, location.end);
};

language.CallDepth.prototype.apply = function (fun) {
	if (this.depth >= this.limit) {
		throw new language.Exception("Limit of call depth exceeded");
	}
	
	this.depth++;
	try {
		return fun();
	} finally {
		this.depth--;
	}
};

language.Collector.prototype.list = function () {
	const collector = this;
	return Object.keys(collector.symbols).sort().map(function (key) {
		return collector.symbols[key];
	});
};

language.Collector.prototype.findOrAdd = function (name) {
	if (!this.symbols[name]) {
		this.symbols[name] = new language.Symbol(name);
	}
	return this.symbols[name];
};

language.Collector.prototype.add = function (symbol) {
	if (this.symbols[symbol.name]) {
		throw new Error("Duplicate symbol '" + symbol.name + "'");
	}
	this.symbols[symbol.name] = symbol;
};

language.Collector.prototype.addBasic = function () {
	const collector = this;
	
	collector.add(
		new language.Symbol(
			"head",
			new language.Expression(
				function (argument) {
					language.functions.requireNonEmpty(argument);
					return argument[0];
				}
			)
		)
	);
	
	collector.add(
		new language.Symbol(
			"tail",
			new language.Expression(
				function (argument) {
					language.functions.requireNonEmpty(argument);
					return argument.slice(1);
				}
			)
		)
	);
	
	collector.add(
		new language.Symbol(
			"flat",
			new language.Expression(
				function (argument) {
					language.functions.requireListOfLists(argument);
					return argument.reduce(function (a, b) { return a.concat(b) }, []);
				}
			)
		)
	);
	
	collector.add(
		new language.Symbol(
			"exists",
			new language.Expression(
				function (argument) {
					language.functions.requireList(argument);
					return argument.length > 0 ? collector.symbols.true : collector.symbols.false;
				}
			)
		)
	);
	
	collector.add(
		new language.Symbol(
			"false",
			new language.Expression(
				function (argument) {
					return collector.symbols.true;
				}
			)
		)
	);
	
	collector.add(
		new language.Symbol(
			"true",
			new language.Expression(
				function (argument) {
					return argument;
				}
			)
		)
	);
};

language.functions = {
	
	isSymbol: function (argument) {
		return argument instanceof language.Symbol;
	},
	
	isList: function (argument) {
		return Array.isArray(argument);
	},
	
	requireList: function (argument) {
		if (!language.functions.isList(argument)) {
			throw new language.Exception("Expected list as argument");
		}
	},
	
	requireListOfLists: function (argument) {
		language.functions.requireList(argument);
		argument.forEach(function (x) {
			if (!language.functions.isList(x)) {
				throw new language.Exception("Expected list of lists as argument");
			}
		});
	},
	
	requireNonEmpty: function (argument) {
		if (!language.functions.isList(argument) || !argument.length) {
			throw new language.Exception("Expected non-empty list as argument");
		}
	},
	
	areEqual: function (first, second) {
		if (language.functions.isList(first) &&
			language.functions.isList(second)) {
			
			if (first.length !== second.length) {
				return false;
			}
			
			for (let i = 0; i < first.length; i++) {
				if (!language.functions.areEqual(first[i], second[i])) {
					return false;
				}
			}
			
			return true;
		}
		
		if (language.functions.isSymbol(first) &&
			language.functions.isSymbol(second)) {
			return first.name === second.name;
		}
		
		return false;
	},
	
	serialize: function (argument, indent, prefix) {
		if (language.functions.isList(argument)) {
			if (indent > 0) {
				return prefix + "[" + argument.map(
					function (x) {
						return "\n" + language.functions.serialize(x, indent - 1, prefix + "\t");
					}
				).join(",") + "\n" + prefix + "]";
			}
			
			return prefix + "[" + argument.map(
				function (x) {
					return language.functions.serialize(x, 0, "");
				}
			).join(", ") + "]";
		}
		
		if (language.functions.isSymbol(argument)) {
			return prefix + argument.name;
		}
	},
	
	depthOf: function (argument) {
		return language.functions.isList(argument) ?
			argument.map(language.functions.depthOf).reduce(function (a, b) { return Math.max(a, b); }, 0) + 1 : 0;
	},
	
	identityOf: function (location) {
		return new language.Expression(function (argument) { return argument; }, location);
	},
	
	listOf: function (list, location) {
		return new language.Expression(
			function (argument) {
				return list.map(function (expr) { return expr.fun(argument); });
			},
			location
		);
	},
	
	symbolOf: function (symbol, location) {
		return new language.Expression(function (argument) { return symbol; }, location);
	},
	
	callOf: function (leftExpr, rightExpr, callDepth) {
		const location = leftExpr.location.merge(rightExpr.location);
		return new language.Expression(
			function (argument) {
				const left = leftExpr.fun(argument);
				
				if (!language.functions.isSymbol(left)) {
					throw new language.Exception("Expected symbol, but was " + language.functions.serialize(left, 0, ""), leftExpr.location);
				}
				
				if (!left.expr) {
					throw new language.Exception("Undefined symbol '" + left.name + "' in call", leftExpr.location);
				}
				
				const right = rightExpr.fun(argument);
				
				try {
					return callDepth.apply(function () { return left.expr.fun(right); });
				} catch (exception) {
					exception.stackTrace.push(new language.Call(left, right, location));
					throw exception;
				}
			},
			location
		);
	}
};

language.compiler = {
	
	Exception: function (message, location) {
		this.message = message;
		this.location = location;
	},
	
	create: function () {
		let location = new language.Location();
		const callDepth = new language.CallDepth();
		const collector = new language.Collector();
		
		collector.addBasic();
		
		function updateLocation(begin, end) {
			location = new language.Location(location.source, begin, end);
		}
		
		function resetLocation(source) {
			location = new language.Location(source);
		}
		
		function createBaseProcessor(usage) {
			
			function reduceCall(call) {
				return call.reduceRight(function (a, b) {
					return language.functions.callOf(b, a, callDepth);
				});
			}
			
			function createMainFrame() {
				const call = [];
				
				return {
					accumulate: function (expr) {
						call.push(expr);
					},
					
					finalizeGroup: function () {
						if (!call.length) {
							throw "Illegal empty expression";
						}
						return reduceCall(call);
					},
					
					delimitList: function () {
						throw "Illegal ',' outside of list";
					},
					
					finalizeList: function () {
						throw "Expected ')' instead of ']'";
					},
					
					throwIncomplete: function () {
						throw "Expected ')' before end of expression";
					}
				};
			};
			
			function createGroupFrame(open) {
				const frame = createMainFrame();
				const finalizeParent = frame.finalizeGroup;
				
				frame.finalizeGroup = function () {
					const expr = finalizeParent();
					expr.location = open.merge(location);
					return expr;
				};
				
				return frame;
			}
			
			function createListFrame(open) {
				const list = [];
				let call = [];
				
				return {
					accumulate: function (expr) {
						call.push(expr);
					},
					
					finalizeGroup: function () {
						throw "Expected ']' instead of ')'";
					},
					
					delimitList: function () {
						if (!call.length) {
							if (list.length) {
								throw "Illegal empty expression between two ','";
							} else {
								throw "Illegal empty expression between '[' and ','";
							}
						}
						list.push(reduceCall(call));
						call = [];
					},
					
					finalizeList: function () {
						if (call.length) {
							list.push(reduceCall(call));
						} else if (list.length) {
							throw "Illegal empty expression between ',' and ']'";
						}
						return language.functions.listOf(list, open.merge(location));
					},
					
					throwIncomplete: function () {
						throw "Expected ']' before end of expression";
					}
				};
			};
			
			let frame = createMainFrame();
			
			function pushFrame(next) {
				next.parent = frame;
				frame = next;
			};
			
			function popFrame(expr) {
				frame = frame.parent;
				frame.accumulate(expr);
			};
			
			return {
				symbol: function (name) {
					const symbol = collector.findOrAdd(name);
					frame.accumulate(language.functions.symbolOf(symbol, location));
					symbol.usages.push(new language.Usage(usage, location));
				},
				
				argument: function () {
					frame.accumulate(language.functions.identityOf(location));
				},
				
				openGroup: function () {
					pushFrame(createGroupFrame(location));
				},
				
				closeGroup: function () {
					if (!frame.parent) {
						throw "No corresponding '(' for given ')'";
					}
					popFrame(frame.finalizeGroup());
				},
				
				openList: function () {
					pushFrame(createListFrame(location));
				},
				
				delimitList: function () {
					frame.delimitList();
				},
				
				closeList: function () {
					if (!frame.parent) {
						throw "No corresponding '[' for given ']'";
					}
					popFrame(frame.finalizeList());
				},
				
				finalize: function () {
					if (frame.parent) {
						frame.throwIncomplete();
					}
					return frame.finalizeGroup();
				}
			};
		};
		
		function createExprProcessor() {
			const processor = createBaseProcessor();
			
			processor.argument = function () {
				throw "Unexpected '*' in expression";
			};
			
			processor.beginDef = function () {
				throw "Unexpected '=' in expression";
			};
			
			processor.endDef = function () {
				throw "Unexpected '.' in expression";
			};
			
			return processor;
		};
		
		function createDefsProcessor() {
			let symbol = null;
			let expr = null;
			
			function delegate(property, chr) {
				if (expr) {
					expr[property]();
				} else {
					throw "Unexpected '" + chr + "' outside of expression";
				}
			}
			
			return {
				symbol: function (name) {
					if (!symbol) {
						symbol = collector.findOrAdd(name);
						if (symbol.expr) {
							throw "Duplicate definition of '" + name + "'";
						}
						symbol.location = location;
					} else if (expr) {
						expr.symbol(name);
					} else {
						throw "Expected '=' after symbol";
					}
				},
				
				argument: function () {
					delegate("argument", "*");
				},
				
				openGroup: function () {
					delegate("openGroup", "(");
				},
				
				closeGroup: function () {
					delegate("closeGroup", ")");
				},
				
				openList: function () {
					delegate("openList", "[");
				},
				
				delimitList: function () {
					delegate("delimitList", ",");
				},
				
				closeList: function () {
					delegate("closeList", "]");
				},
				
				beginDef: function () {
					if (!symbol) {
						throw "Missing symbol before '='";
					}
					if (expr) {
						throw "Unexpected '=' in expression";
					}
					expr = createBaseProcessor(symbol);
				},
				
				endDef: function () {
					if (!expr) {
						throw "Illegal '.' before expression";
					}
					symbol.expr = expr.finalize();
					symbol.location = symbol.location.merge(location);
					symbol = null;
					expr = null;
				},
				
				finalize: function () {
					if (symbol) {
						throw "Incomplete definition";
					}
				}
			};
		};
		
		function processTokens(code, processor) {
			try {
				let symbol = null;
				let begin;
				
				for (let i = 0; i < code.length; i++) {
					const chr = code[i];
					if (chr.match(/[a-zA-Z0-9\-]/)) {
						if (!symbol) {
							symbol = "";
							begin = i;
						}
						symbol += chr;
					} else {
						if (symbol) {
							updateLocation(begin, i);
							processor.symbol(symbol);
							symbol = null;
						}
						
						if (!chr.match(/[ \f\n\r\t\v]/)) {
							updateLocation(i, i + 1);
							switch (chr) {
								case '*':
									processor.argument();
									break;
								case '(':
									processor.openGroup();
									break;
								case ')':
									processor.closeGroup();
									break;
								case '[':
									processor.openList();
									break;
								case ',':
									processor.delimitList();
									break;
								case ']':
									processor.closeList();
									break;
								case '=':
									processor.beginDef();
									break;
								case '.':
									processor.endDef();
									break;
								default:
									throw "Illegal character '" + chr + "'";
							}
						}
					}
				}
				
				if (symbol) {
					updateLocation(begin, code.length);
					processor.symbol(symbol);
				}
				
				updateLocation(code.length, code.length);
				return processor.finalize();
			} catch (message) {
				throw new language.compiler.Exception(message, location);
			}
		};
		
		return {
			symbolList: function () {
				return collector.list();
			},
			
			locationSource: function (source) {
				resetLocation(source);
			},
			
			limitCallDepth: function (limit) {
				callDepth.limit = limit;
			},
			
			compileExpr: function (code) {
				return processTokens(code, createExprProcessor());
			},
			
			compileDefs: function (code) {
				return processTokens(code, createDefsProcessor());
			}
		};
	}
}
