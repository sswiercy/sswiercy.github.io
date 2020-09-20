const problem = (function () {
	
	function createTdWithText(text) {
		const td = document.createElement("td");
		td.innerText = text;
		return td;
	}
	
	function createTdWithClass(className) {
		const td = document.createElement("td");
		td.className = className;
		return td;
	}
	
	function createTdWithChild(child) {
		const td = document.createElement("td");
		td.appendChild(child);
		return td;
	}
	
	function createPre(text) {
		const pre = document.createElement("pre");
		pre.innerText = text;
		return pre;
	}
	
	function createPreButton(text, title, onclick) {
		const pre = createPre(text);
		pre.title = title;
		pre.onclick = onclick;
		pre.className = "button";
		return pre;
	}
	
	function createDiv(text) {
		const div = document.createElement("div");
		div.innerText = text;
		return div;
	}
	
	function storageKey(statement) {
		return "lisymp-problem-<" + statement.name + ">";
	}
	
	function storeSuccess(statement) {
		const select = document.getElementById("problem-select");
		select.classList.add("success");
		select.options[select.selectedIndex].classList.add("success");
		window.localStorage.setItem(storageKey(statement), document.getElementById("definitions").value);
	}
	
	function restoreSuccess(statement) {
		const select = document.getElementById("problem-select");
		const definitions = window.localStorage.getItem(storageKey(statement));
		
		if (definitions !== null) {
			select.classList.add("success");
			if (confirm("Overwrite definitions with solution from this problem?")) {
				editor.doUpdateDefinitions(definitions);
			}
		} else {
			select.classList.remove("success");
		}
	}
	
	function isSuccessful(statement) {
		return window.localStorage.getItem(storageKey(statement)) !== null;
	}
	
	function findStatement() {
		const select = document.getElementById("problem-select");
		if (select.value) {
			const path = select.value.split("-");
			return problem.list[path[0]].statements[path[1]];
		}
	}
	
	function problemTitle(group, index) {
		return group.prefix + (index + 1) + ": " + group.statements[index].name;
	}
	
	function problemLabel(groupIndex, statementIndex) {
		return groupIndex + "-" + statementIndex;
	}
	
	function resolveRefs(description) {
		return description.replace(
			/\{PROBLEM:([^\}]*)\}/g,
			function (match, param) {
				for (let i = 0; i < problem.list.length; i++) {
					const group = problem.list[i];
					for (let j = 0; j < group.statements.length; j++) {
						if (group.statements[j].name === param) {
							return "<button type=\"button\" title=\"Click to open this problem\" onclick=\"problem.doSelect(" + i + ", " + j + ")\">" + problemTitle(group, j) + "</button>";
						}
					}
				}
				alert("Unknown reference to problem '" + param + "'");
			}
		);
	}
	
	function compileExpected(instance) {
		return language.compiler.create().compileExpr(instance.expected).fun();
	}
	
	function serialize(instance, argument) {
		return language.functions.serialize(argument, instance.indent, "");
	}
	
	function createInstanceRow(instance, index) {
		const tr = document.createElement("tr");
		tr.appendChild(createTdWithText(index + 1));
		tr.appendChild(
			createTdWithChild(
				createPreButton(
					instance.expression,
					"Click to copy to editor and compile",
					function () {
						copyExpression(instance.expression);
					}
				)
			)
		);
		tr.appendChild(
			createTdWithChild(
				createPre(
					serialize(instance, compileExpected(instance))
				)
			)
		);
		tr.appendChild(createTdWithClass("actual"));
		return tr;
	}
	
	function forActuals(fun) {
		Array.prototype.forEach.call(
			document.getElementById("validation").getElementsByClassName("actual"), fun
		);
	}
	
	function copyExpression(expression) {
		editor.doUpdateExpression(expression);
		editor.doCompile();
		document.getElementById("expression").scrollIntoView();
	}
	
	function clearElement(element) {
		while (element.firstChild){
			element.removeChild(element.firstChild);
		}
	}
	
	function clear(id) {
		clearElement(document.getElementById(id));
	}
	
	function writeHtml(id, html) {
		document.getElementById(id).innerHTML = html;
	}
	
	function writeText(id, text) {
		document.getElementById(id).innerText = text;
	}
	
	function addClass(id, name) {
		document.getElementById(id).classList.add(name);
	}
	
	function removeClass(id, name) {
		document.getElementById(id).classList.remove(name);
	}
	
	function showElement(element) {
		element.classList.remove("hidden");
	}
	
	function hideElement(element) {
		element.classList.add("hidden");
	}
	
	function show(id) {
		showElement(document.getElementById(id));
	}
	
	function hide(id) {
		hideElement(document.getElementById(id));
	}
	
	return {
		Instance: function (expression, expected, indent) {
			this.expression = expression;
			this.expected = expected;
			this.indent = indent;
		},
		
		Statement: function (name, description, instances, definitions) {
			this.name = name;
			this.description = description;
			this.instances = instances;
			this.definitions = definitions;
		},
		
		Group: function (name, prefix, statements) {
			this.name = name;
			this.prefix = prefix;
			this.statements = statements;
		},
		
		doSelectProblem: function () {
			const statement = findStatement();
			
			if (statement) {
				restoreSuccess(statement);
				writeHtml("description", resolveRefs(statement.description));
				
				if (statement.definitions) {
					document.getElementById("problem-definitions").innerText = statement.definitions;
					show("validation-definitions");
				} else {
					hide("validation-definitions");
				}
				
				if (statement.instances) {
					clear("instances");
					const instances = document.getElementById("instances");
		
					findStatement().instances.map(createInstanceRow).forEach(function (row) {
						instances.appendChild(row);
					});
					
					forActuals(hideElement);
					hide("validation-error");
					show("validation");
				} else {
					hide("validation");
				}
				
				addClass("introduction", "faded");
				show("problem-info");
			} else {
				removeClass("introduction", "faded");
				hide("problem-info");
				
				document.getElementById("problem-select").classList.remove("success");
			}
		},
		
		doSelect: function (groupIndex, statementIndex) {
			const select = document.getElementById("problem-select");
			select.value = problemLabel(groupIndex, statementIndex);
			problem.doSelectProblem();
			select.scrollIntoView();
			
		},
		
		doValidate: function () {
			try {
				const statement = findStatement();
				const compiler = editor.prepareCompiler();
				const instances = document.getElementById("instances");
				let successful = true;
				
				statement.instances.forEach(function (instance, index) {
					Array.prototype.forEach.call(
						instances.children[index].getElementsByClassName("actual"),
						function (element) {
							clearElement(element);
							element.classList.remove("true", "false", "error");
							try {
								const actual = compiler.compileExpr(instance.expression).fun();
								const expected = compileExpected(instance);
								
								if (language.functions.areEqual(actual, expected)) {
									element.classList.add("true");
								} else {
									element.classList.add("false");
									successful = false;
								}
								
								element.appendChild(createPre(serialize(instance, actual)));
							} catch (exception) {
								element.classList.add("error");
								element.appendChild(createDiv(exception.message));
								successful = false;
							}
						}
					);
				});
				
				if (successful) {
					storeSuccess(statement);
				}
				
				forActuals(showElement);
				hide("validation-error");
			} catch (exception) {
				forActuals(hideElement);
				
				const error = document.getElementById("validation-error");
				error.innerText = exception.message;
				showElement(error);
			}
		},
		
		compileDefinitions: function (compiler) {
			const statement = findStatement();
			if (statement && statement.definitions) {
				compiler.compileDefs(statement.definitions);
			}
		},
		
		onLoad: function () {
			const select = document.getElementById("problem-select");
			
			problem.list.forEach(function (group, groupIndex) {
				const optgroup = document.createElement("optgroup");
				optgroup.label = group.name;
				
				group.statements.forEach(function (statement, statementIndex) {
					const option = document.createElement("option");
					option.innerText = problemTitle(group, statementIndex);
					option.value = problemLabel(groupIndex, statementIndex);
					if (isSuccessful(statement)) {
						option.classList.add("success");
					}
					optgroup.appendChild(option);
				});
				
				select.appendChild(optgroup);
			});
		}
	};
})();

window.addEventListener("load", problem.onLoad);
