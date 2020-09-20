const editor = (function () {
	
	const loadKey = "lisymp-load";
	const defsPrefix = "lisymp-defs-";
	const exprPrefix = "lisymp-expr-";
	
	const programs = {};
	let symbols;
	let usages;
	let expression;
	let evaluation;
	
	function Program(defs, expr) {
		this.defs = defs;
		this.expr = expr;
	}

	function removeChildren(node, from) {
		while (node.children.length > from) {
			node.removeChild(node.children[from]);
		}
	}

	function toggle(id, disable) {
		document.getElementById(id).disabled = disable;
	}

	function toggleUsages(disable) {
		toggle("usage", disable);
		toggle("previous", disable);
		toggle("next", disable);
	}

	function toggleEvaluate(disable) {
		toggle("symbol", disable);
		toggle("evaluate", disable);
		toggleUsages(true);
		hideEvaluation();
	}

	function hideError() {
		document.getElementById("error-box").style.display = "none";
	}

	function showError(elements) {
		const error = document.getElementById("error");
		removeChildren(error, 0);
		elements.forEach(function (element) {
			error.appendChild(element);
		});
		document.getElementById("error-box").style.display = "block";
	}

	function hideEvaluation() {
		document.getElementById("evaluation-box").style.display = "none";
	}

	function showEvaluation(content) {
		document.getElementById("evaluation").innerHTML = content;
		document.getElementById("evaluation-box").style.display = "block";
	}

	function selectLocation(location) {
		if (location.source) {
			const textarea = document.getElementById(location.source);
			textarea.selectionStart = location.begin;
			textarea.selectionEnd = location.end;
			textarea.focus();
		}
	}

	function createLocationLink(text, location) {
		if (location && location.source) {
			const button = document.createElement("button");
			button.onclick = function () {
				selectLocation(location);
			};
			button.title = "Click to mark the corresponding code section";
			button.appendChild(document.createTextNode(text));
			return button;
		}
		
		const span = document.createElement("span");
		span.appendChild(document.createTextNode(text));
		return span;
	}

	function showEvaluationError(exception) {
		const message = createLocationLink(exception.message, exception.location);
		
		if (exception.stackTrace.length) {
			const ol = document.createElement("ol");
			
			exception.stackTrace.forEach(function (call) {
				const li = document.createElement("li");
				li.appendChild(createLocationLink(call.symbol.name + " " + language.functions.serialize(call.argument, 0, ""), call.location));
				ol.appendChild(li);
			});
			
			showError([message, ol]);
		} else {
			showError([message]);
		}
	}

	function populateSelect(id, list, index) {
		const select = document.getElementById(id);
		removeChildren(select, 1);
		
		list.forEach(function (text) {
			const option = document.createElement("option");
			option.innerText = text;
			select.appendChild(option);
		});
		
		select.selectedIndex = index;
	}

	function populatePrograms(name) {
		const list = Object.keys(programs).sort();
		populateSelect("program", list, list.indexOf(name) + 1);
		editor.doSelectProgram();
	}

	function populateSymbols(list) {
		symbols = list;
		populateSelect(
			"symbol",
			list.map(function (symbol) {
				return symbol.name + (symbol.location && symbol.location.source ? "" : "*") + " (" + symbol.usages.length + ")";
			}),
			0
		);
	}

	function populateUsages(list) {
		usages = list;
		populateSelect(
			"usage",
			list.map(function (usage, index) {
				return (index + 1) + (usage.symbol ? ": " + usage.symbol.name + (usage.location.source ? "" : "*") : "");
			}),
			0
		);
	}

	function populateIndent(depth) {
		const list = [];
		for (let i = 0; i < depth; i++) {
			list.push(i + 1);
		}
		populateSelect("indent", list, 0);
	}
	
	function toStorageKey(prefix, name) {
		return prefix + "<" + name + ">";
	}
	
	function fromStorageKey(prefix, key) {
		if (key.startsWith(prefix + "<") && key.endsWith(">")) {
			return key.substring(prefix.length + 1, key.length - 1);
		}
		return null;
	}

	function readStorage(prefix) {
		const map = {};
		
		Object.keys(window.localStorage).map(function (key) {
			return fromStorageKey(prefix, key);
		}).filter(function (name) {
			return name !== null;
		}).forEach(function (name) {
			map[name] = window.localStorage.getItem(toStorageKey(prefix, name));
		});
		
		return map;
	}

	function readPrograms() {
		const defs = readStorage(defsPrefix);
		const expr = readStorage(exprPrefix);
		
		Object.keys(defs).forEach(function (name) {
			if (expr.hasOwnProperty(name)) {
				programs[name] = new Program(defs[name], expr[name]);
			}
		});
	}

	function readProgramName() {
		return document.getElementById("program-name").value.trim();
	}

	function disableLoading() {
		toggle("save", true);
		toggle("load", true);
	}

	function loadProgram() {
		const select = document.getElementById("program");
		
		if (select.selectedIndex) {
			const name = select.value;
			
			document.getElementById("program-name").value = name;
			document.getElementById("definitions").value = programs[name].defs;
			document.getElementById("expression").value = programs[name].expr;
			
			toggle("clear", false);
			disableLoading();
			editor.doResize();
			
			return name;
		}
	}

	function setDefaultProgram(name) {
		window.localStorage.setItem(loadKey, name);
	}
	
	function confirmDiscard() {
		return confirm("Discard any unsaved changes?");
	}
	
	function resizeTextarea(id, lines) {
		const element = document.getElementById(id);
		element.style.height = "auto";
		element.rows = lines;
	}
	
	function adjustTextarea(id) {
		resizeTextarea(id, document.getElementById(id).value.split(/\n/g).length);
	}
	
	function resizeDefinitions() {
		adjustTextarea("definitions");
	}
	
	function resizeExpression() {
		adjustTextarea("expression");
	}
	
	return {
		doUpdateDefinitions: function (definitions) {
			document.getElementById("definitions").value = definitions;
			resizeDefinitions();
			editor.doUpdateCode();
		},
		
		doUpdateExpression: function (expression) {
			document.getElementById("expression").value = expression;
			resizeExpression();
			editor.doUpdateCode();
		},
		
		doResize: function () {
			resizeDefinitions();
			resizeExpression();
		},
		
		doClear: function () {
			if (confirmDiscard()) {
				document.getElementById("program-name").value = "";
				document.getElementById("definitions").value = "";
				document.getElementById("expression").value = "";
				
				window.localStorage.removeItem(loadKey);
				
				resizeTextarea("definitions", 10);
				resizeTextarea("expression", 1);
				
				editor.doUpdateCode();
				populatePrograms();
				toggle("clear", true);
			}
		},
		
		doUpdateProgram: function () {
			toggle("clear", false);
			toggle("save", !readProgramName());
			editor.doSelectProgram();
		},

		doSave: function () {
			const name = readProgramName();
			
			if (!programs[name] || confirm("Overwrite existing program?")) {
				const defs = document.getElementById("definitions").value;
				const expr = document.getElementById("expression").value;

				window.localStorage.setItem(toStorageKey(defsPrefix, name), defs);
				window.localStorage.setItem(toStorageKey(exprPrefix, name), expr);

				programs[name] = new Program(defs, expr);
				
				populatePrograms(name);
				setDefaultProgram(name);
				disableLoading();
			}
		},

		doSelectProgram: function () {
			const disable = !document.getElementById("program").selectedIndex;
			toggle("load", disable);
			toggle("remove", disable);
		},

		doLoad: function () {
			if (confirmDiscard()) {
				editor.doUpdateCode();
				setDefaultProgram(loadProgram());
			}
		},

		doRemove: function () {
			if (confirm("Remove the selected program?")) {
				const name = document.getElementById("program").value;
				
				window.localStorage.removeItem(toStorageKey(defsPrefix, name));
				window.localStorage.removeItem(toStorageKey(exprPrefix, name));
				
				delete programs[name];
				populatePrograms();
				
				editor.doUpdateProgram();
			}
		},

		doUpdateCode: function () {
			toggle("compile", false);
			hideError();
			toggleEvaluate(true);
			toggle("indent", true);
			
			populateSymbols([]);
			populateUsages([]);
			populateIndent(0);
			
			editor.doUpdateProgram();
		},

		doCompile: function () {
			try {
				const compiler = editor.prepareCompiler();
				expression = compiler.compileExpr(document.getElementById("expression").value);
				
				hideError();
				toggleEvaluate(false);

				populateSymbols(compiler.symbolList());
			} catch (exception) {
				selectLocation(exception.location);
				
				showError([createLocationLink(exception.message, exception.location)]);
				toggleEvaluate(true);
				
				populateSymbols([]);
			}
			
			toggle("compile", true);
			populateUsages([]);
		},

		doEvaluate: function () {
			try {
				evaluation = expression.fun();

				toggle("indent", false);
				populateIndent(language.functions.depthOf(evaluation));
				
				hideError();
				editor.doSelectIndent();
			} catch (exception) {
				if (exception.location) {
					selectLocation(exception.location);
				}
				
				showEvaluationError(exception);
				hideEvaluation();
			}
			
			toggle("evaluate", true);
		},

		doSelectSymbol: function () {
			const select = document.getElementById("symbol");
			
			if (select.selectedIndex) {
				const symbol = symbols[select.selectedIndex - 1];
				if (symbol.location) {
					selectLocation(symbol.location);
				}
				
				toggleUsages(!symbol.usages.length);
				populateUsages(symbol.usages);
			} else {
				toggleUsages(true);
				populateUsages([]);
			}
		},

		doSelectUsage: function () {
			const select = document.getElementById("usage");
			if (select.selectedIndex) {
				selectLocation(usages[select.selectedIndex - 1].location);
			}
		},

		doPrevious: function () {
			const select = document.getElementById("usage");
			if (--select.selectedIndex < 1) {
				select.selectedIndex = select.length - 1;
			}
			editor.doSelectUsage();
		},

		doNext: function () {
			const select = document.getElementById("usage");
			if (++select.selectedIndex >= select.length) {
				select.selectedIndex = 1;
			}
			editor.doSelectUsage();
		},

		doSelectIndent: function () {
			showEvaluation(language.functions.serialize(evaluation, document.getElementById("indent").value, ""));
		},
		
		prepareCompiler: function () {
			const compiler = language.compiler.create();
			compiler.limitCallDepth(100);
			problem.compileDefinitions(compiler);
			compiler.locationSource("definitions");
			compiler.compileDefs(document.getElementById("definitions").value);
			compiler.locationSource("expression");
			return compiler;
		},
		
		onLoad: function () {
			readPrograms();
			populatePrograms(window.localStorage.getItem(loadKey));
			loadProgram();
		}
	};
})();

window.addEventListener("load", editor.onLoad);
