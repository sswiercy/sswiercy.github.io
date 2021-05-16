const editor = (function () {
	
	const maskPrefix = "crossword-mask-";
	
	var configuration = null;
	var generator = null;
	var generated = false;
	var mark = null;
	
	const disabledInputs = [];
	
	function Position(x, y) {
		this.x = x;
		this.y = y;
	}
	
	Position.prototype.equals = function (other) {
		return this.x === other.x && this.y === other.y;
	};
	
	Position.prototype.findCell = function () {
		return document.getElementById("grid").firstChild.children[this.y].children[this.x];
	};
	
	function positionOfCell(element) {
		const tr = element.parentNode;
		return new Position(
			Array.prototype.indexOf.call(tr.children, element),
			Array.prototype.indexOf.call(tr.parentNode.children, tr)
		);
	}
	
	function Mark(position, orientation) {
		this.position = position;
		this.orientation = orientation;
	}
	
	function activeAt(position) {
		return position && generator.isActive(position.x, position.y);
	}
	
	Mark.prototype.extractWord = function () {
		var word = "";
		this.cellPositions().forEach(function (position) {
			word += generator.getCharacter(position.x, position.y);
		});
		return word;
	};
	
	Mark.prototype.cellPositions = function () {
		var current;
		var next = this.position;
		while (activeAt(next)) {
			current = next;
			next = this.orientation(current, -1);
		}
		const result = [];
		while (activeAt(current)) {
			result.push(current);
			current = this.orientation(current, 1);
		}
		return result;
	};
	
	Mark.prototype.applyClass = function (className, title) {
		this.cellPositions().forEach(function (position) {
			const cell = position.findCell();
			cell.className = className;
			if (title) {
				cell.title = title;
			} else {
				cell.removeAttribute("title");
			}
		});
	};
	
	Mark.prototype.equals = function (other) {
		return this.position.equals(other.position) && this.orientation === other.orientation;
	};
	
	function markFromEvent(event) {
		const ratioX = event.offsetX / event.target.offsetWidth;
		const ratioY = event.offsetY / event.target.offsetHeight;
		
		const position = positionOfCell(event.target);
		
		if (!generator.isActive(position.x, position.y)) {
			return null;
		}
		
		const hasHorizontal = activeAt(horizontal(position, -1)) || activeAt(horizontal(position, 1));
		const hasVertical = activeAt(vertical(position, -1)) || activeAt(vertical(position, 1));
		const isHorizontal = (ratioX <= ratioY && ratioX < 1 - ratioY) || (ratioX >= ratioY && ratioX > 1 - ratioY);
		
		if (hasHorizontal && (isHorizontal || !hasVertical)) {
			return new Mark(position, horizontal);
		}
		
		if (hasVertical && (!isHorizontal || !hasHorizontal)) {
			return new Mark(position, vertical);
		}
		
		return null;
	}
	
	function horizontal(position, offset) {
		const x = position.x + offset;
		return x >= 0 && x < generator.getWidth() ? new Position(x, position.y) : null;
	}
	
	function vertical(position, offset) {
		const y = position.y + offset;
		return y >= 0 && y < generator.getHeight() ? new Position(position.x, y) : null;
	}
	
	function clearChildren(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}
	
	function updateSize() {
		generator.resize(
			document.getElementById("width").value,
			document.getElementById("height").value
		);
		clearGeneration();
	}
	
	function binarySearch(word) {
		var lower = 0;
		var upper = configuration.dictionary.length;
		
		while (lower < upper) {
			const middle = Math.floor((lower + upper) / 2);
			if (word < configuration.dictionary[middle]) {
				upper = middle;
			} else if (word > configuration.dictionary[middle]) {
				lower = middle + 1;
			} else {
				return middle;
			}
		}
		
		return lower;
	}
	
	function addToDictionary(word) {
		const index = binarySearch(word);
		if (configuration.dictionary[index] !== word) {
			configuration.dictionary.splice(index, 0, word);
		}
	}
	
	function clearExceptions() {
		const exceptions = document.getElementById("dictionary-exceptions");
		for (let i = 0; i < exceptions.children.length; i++) {
			addToDictionary(exceptions.children[i].value);
		}
		clearChildren(exceptions);
		document.getElementById("clear-exceptions").disabled = true;
	}
	
	function insertException(selectedWord) {
		const exceptions = document.getElementById("dictionary-exceptions");
		const input = document.createElement("input");
		
		input.type = "button";
		input.value = selectedWord;
		input.title = "remove this word from the list of dictionary exceptions";
		input.addEventListener("click", function () {
			addToDictionary(selectedWord);
			exceptions.removeChild(input);
			if (exceptions.childElementCount == 0) {
				document.getElementById("clear-exceptions").disabled = true;
			}
		});
		
		for (let i = 0; i < exceptions.children.length; i++) {
			const currentWord = exceptions.children[i].value;
			if (selectedWord == currentWord) {
				return false;
			}
			if (selectedWord < currentWord) {
				exceptions.insertBefore(input, exceptions.children[i]);
				return true;
			}
		}
		
		exceptions.appendChild(input);
		return true;
	}
	
	function clickCell(x, y) {
		if (generated) {
			if (mark) {
				const selectedWord = mark.extractWord();
				if (insertException(selectedWord)) {
					configuration.dictionary.splice(binarySearch(selectedWord), 1);
					document.getElementById("clear-exceptions").disabled = false;
				}
			}
		} else {
			if (generator.isActive(x, y)) {
				generator.deactivate(x, y);
			} else {
				generator.activate(x, y);
			}
			render();
		}
	}
	
	function mouseOverCell(event) {
		if (generated) {
			const newMark = markFromEvent(event);
			if (!mark || !newMark || !newMark.equals(mark)) {
				if (mark) {
					mark.applyClass("");
				}
				if (newMark) {
					newMark.applyClass("marked", "click to add word to the list of dictionary exceptions");
				}
			}
			mark = newMark;
		}
	}
	
	function validateName() {
		const name = document.getElementById("mask-name").value;
		document.getElementById("save").disabled = name.trim() !== name || name.length == 0;
	}
	
	function toMaskKey(name) {
		return maskPrefix + "<" + name + ">";
	}
	
	function fromMaskKey(key) {
		if (key.startsWith(maskPrefix + "<") && key.endsWith(">")) {
			return key.substring(maskPrefix.length + 1, key.length - 1);
		}
		return null;
	}
	
	function listMasks() {
		return Object
			.keys(window.localStorage)
			.map(fromMaskKey)
			.filter(function (name) {
				return name !== null;
			});
	}
	
	function selectedMask() {
		const select = document.getElementById("stored-masks");
		return select.options[select.selectedIndex].text;
	}
	
	function resetMark() {
		if (mark) {
			mark.applyClass("");
			mark = null;
		}
	}
	
	function setNotGenerated() {
		resetMark();
		generated = false;
	}
	
	function loadMask() {
		const name = selectedMask();
		generator.deserialize(window.localStorage.getItem(toMaskKey(name)));
		setNotGenerated();
		
		document.getElementById("width").value = generator.getWidth();
		document.getElementById("height").value = generator.getHeight();
		document.getElementById("mask-name").value = name;
		
		validateName();
		render();
	}
	
	function deleteMask() {
		window.localStorage.removeItem(toMaskKey(selectedMask()));
		populateMasks();
	}
	
	function saveMask() {
		const name = document.getElementById("mask-name").value;
		window.localStorage.setItem(toMaskKey(name), generator.serialize());
		populateMasks(name);
	}
	
	function populateMasks(preselect) {
		const select = document.getElementById("stored-masks");
		const masks = listMasks();
		clearChildren(select);
		if (masks.length > 0) {
			masks.sort().forEach(function (name) {
				const option = document.createElement("option");
				option.innerText = name;
				if (name === preselect) {
					option.selected = true;
				}
				select.appendChild(option);
			});
			updateMaskInputs(false);
		} else {
			const option = document.createElement("option");
			option.innerText = "< none >";
			select.appendChild(option);
			updateMaskInputs(true);
		}
	}
	
	function updateMaskInputs(disabled) {
		document.getElementById("stored-masks").disabled = disabled;
		document.getElementById("load").disabled = disabled;
		document.getElementById("delete").disabled = disabled;
	}
	
	function generate() {
		disableInputs();
		clearGeneration();
		generated = true;
		setTimeout(
			function () {
				if (generator.generate()) {
					render();
				} else {
					setNotGenerated();
				}
				enableInputs();
			},
			0
		);
	}
	
	function clearGeneration() {
		setNotGenerated();
		generator.clear();
		render();
	}
	
	function disableInputsOf(element) {
		if (element.disabled === false) {
			element.disabled = true;
			disabledInputs.push(element);
		}
		for (let i = 0; i < element.children.length; i++) {
			disableInputsOf(element.children[i]);
		}
	}
	
	function disableInputs() {
		disableInputsOf(document.getElementById("controls"));
	}
	
	function enableInputs() {
		disabledInputs.forEach(function (element) {
			element.disabled = false;
		});
		disabledInputs.length = 0;
	}
	
	function clearMask() {
		generator.clearActive();
		generated = false;
		render();
	}
	
	function filterDuplicates(list) {
		return list.filter(function (value, index) {
			return index == 0 || list[index - 1] !== value;
		});
	}
	
	function loadDictionary() {
		document.getElementById("dictionary-file").click();
	}
	
	function reloadDictionary() {
		const element = document.getElementById("dictionary-file");
		if (element.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener("load", function (event) {
				configuration.dictionary = filterDuplicates(
					event.target.result.split(/\s+/).filter(function (word) {
						return /^[A-Z]+$/.test(word);
					})
				).sort();
				enableInputs();
				document.getElementById("dictionary-reload").disabled = false;
				document.getElementById("dictionary-reset").disabled = false;
				updateDictionaryInfo(element.files[0].name);
			});
			disableInputs();
			reader.readAsText(element.files[0]);
		} else {
			resetDictionary();
		}
	}
	
	function resetDictionary() {
		document.getElementById("dictionary-file").parentNode.reset();
		document.getElementById("dictionary-reload").disabled = true;
		document.getElementById("dictionary-reset").disabled = true;
		configuration.dictionary = defaultDictionary.slice();
		updateDictionaryInfo("Default", "the default dictionary has been generated using http://app.aspell.net/create");
	}
	
	function updateDictionaryInfo(name, title) {
		const nameElement = document.getElementById("dictionary-name");
		nameElement.innerText = name;
		if (title) {
			nameElement.title = title;
		} else {
			nameElement.removeAttribute("title");
		}
		document.getElementById("dictionary-count").innerText = configuration.dictionary.length;
		clearChildren(document.getElementById("dictionary-exceptions"));
		document.getElementById("clear-exceptions").disabled = true;
	}
	
	function trimTextNodes(element) {
		for (let i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
				const trimmed = element.childNodes[i].textContent.trim();
				if (trimmed.length > 0) {
					element.childNodes[i].textContent = trimmed;
				} else {
					element.removeChild(element.childNodes[i--]);
				}
			} else {
				trimTextNodes(element.childNodes[i]);
			}
		}
	}
	
	function setupConfiguration() {
		const randomnessElement = document.getElementById("randomness");
		const maxLevelElement = document.getElementById("max-level");
		const maxTotalElement = document.getElementById("max-total");
		
		configuration = {
			randomness: randomnessElement.value,
			maxLevel: maxLevelElement.value,
			maxTotal: maxTotalElement.value
		};
		
		randomnessElement.addEventListener("change", function (event) {
			configuration.randomness = event.target.value;
		});
		maxLevelElement.addEventListener("change", function (event) {
			configuration.maxLevel = event.target.value;
		});
		maxTotalElement.addEventListener("change", function (event) {
			configuration.maxTotal = event.target.value;
		});
	}
	
	function setupGenerator() {
		const widthElement = document.getElementById("width");
		const heightElement = document.getElementById("height");
		
		generator = newGenerator(widthElement.value, heightElement.value, configuration);
		
		widthElement.addEventListener("change", updateSize);
		heightElement.addEventListener("change", updateSize);
	}
	
	function render() {
		const element = document.getElementById("grid");
		clearChildren(element);
		
		const table = document.createElement("table");
		if (generated) {
			table.className = "generated";
		} else {
			table.title = "click to toggle activation of cell";
		}
		
		for (let j = 0; j < generator.getHeight(); j++) {
			const tr = document.createElement("tr");
			for (let i = 0; i < generator.getWidth(); i++) {
				const td = document.createElement("td");
				td.addEventListener("click", function () {
					clickCell(i, j);
				});
				td.addEventListener("mousemove", mouseOverCell);
				td.addEventListener("mouseleave", resetMark);
				if (generator.isActive(i, j)) {
					td.className = "active";
					td.innerText = generator.getCharacter(i, j);
				} else {
					td.className = "inactive";
				}
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		
		element.appendChild(table);
	}
	
	return {
		onLoad: function () {
			setupConfiguration();
			setupGenerator();
			populateMasks();
			validateName();
			resetDictionary();
			
			document.getElementById("load").addEventListener("click", loadMask);
			document.getElementById("delete").addEventListener("click", deleteMask);
			document.getElementById("mask-name").addEventListener("input", validateName);
			document.getElementById("save").addEventListener("click", saveMask);
			document.getElementById("clear-mask").addEventListener("click", clearMask);
			
			document.getElementById("dictionary-file").addEventListener("change", reloadDictionary);
			document.getElementById("dictionary-load").addEventListener("click", loadDictionary);
			document.getElementById("dictionary-reload").addEventListener("click", reloadDictionary);
			document.getElementById("dictionary-reset").addEventListener("click", resetDictionary);
			document.getElementById("clear-exceptions").addEventListener("click", clearExceptions);
			
			document.getElementById("generate").addEventListener("click", generate);
			document.getElementById("clear-generation").addEventListener("click", clearGeneration);
			
			trimTextNodes(document.getElementById("controls"));
			render();
		}
	};
})();

window.addEventListener("load", editor.onLoad);
