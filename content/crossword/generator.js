function newGenerator(width, height, configuration) {
	
	function OrientedCell(cell) {
		this.cell = cell;
		this.word = null;
		this.index = null;
	}

	OrientedCell.prototype.buildIndex = function () {
		const index = {};
		for (let i = 0; i < this.word.candidates.length; i++) {
			const candidate = this.word.candidates[i];
			const character = candidate[this.index];
			if (!index[character]) {
				index[character] = [];
			}
			index[character].push(candidate);
		}
		return index;
	};

	function Cell() {
		this.clear();
	}
	
	Cell.prototype.clear = function () {
		this.character = null;
		this.horizontal = new OrientedCell(this);
		this.vertical = new OrientedCell(this);
		this.horizontal.other = this.vertical;
		this.vertical.other = this.horizontal;
	};

	function Word() {
		this.cells = [];
		this.candidates = [];
	}
	
	Word.prototype.buildIndex = function () {
		const index = [];
		for (let i = 0; i < this.cells.length; i++) {
			const other = this.cells[i].other;
			index.push(other.word ? other.buildIndex() : null);
		}
		return new WordIndex(this, index);
	};

	function WordIndex(word, index) {
		this.word = word;
		this.index = index;
	}
	
	WordIndex.prototype.evaluateCandidate = function (candidate) {
		const evaluation = new Evaluation();
		evaluation.candidate = candidate;
		evaluation.value = 1 - configuration.randomness * Math.random();
		
		for (let i = 0; i < this.word.cells.length; i++) {
			const thisCell = this.word.cells[i];
			const otherCell = thisCell.other;
			if (otherCell.word) {
				const candidates = this.index[i][candidate[i]];
				if (!candidates) {
					return null;
				}
				evaluation.others.push(candidates);
				evaluation.value *= candidates.length;
			} else {
				evaluation.others.push(null);
			}
		}
		
		return evaluation;
	};

	WordIndex.prototype.evaluate = function () {
		return this.word.candidates.map(
			WordIndex.prototype.evaluateCandidate.bind(this)
		).filter(function (evaluation) {
			return evaluation !== null;
		}).sort(function (a, b) {
			return a.value > b.value ? -1 : 1;
		});
	};

	function Evaluation() {
		this.candidate = null;
		this.value = null;
		this.others = [];
	}

	function Orientation(access, major, minor) {
		this.access = access;
		this.major = major;
		this.minor = minor;
	}

	const orientation = {
		horizontal: new Orientation(
			function (x, y) {
				return this.cells[x][y] ? this.cells[x][y].horizontal : null;
			},
			function () {
				return width;
			},
			function () {
				return height;
			}
		),
		vertical: new Orientation(
			function (x, y) {
				return this.cells[y][x] ? this.cells[y][x].vertical : null;
			},
			function () {
				return height;
			},
			function () {
				return width;
			}
		)
	};
	
	function Grid() {
		this.cells = [];
		for (let x = 0; x < width; x++) {
			this.cells.push([]);
			for (let y = 0; y < height; y++) {
				this.cells[x].push(new Cell());
			}
		}
	}
	
	Grid.prototype.clearActive = function () {
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				this.activate(x, y);
			}
		}
	};
	
	Grid.prototype.clear = function () {
		this.cells.forEach(function (column) {
			column.forEach(function (cell) {
				if (cell) {
					cell.clear();
				}
			});
		});
	};
	
	Grid.prototype.serialize = function () {
		return this.cells.map(function (column) {
			return column.map(function (cell) {
				return cell ? "1" : "0"
			}).join("");
		}).join(" ");
	};
	
	Grid.prototype.deserialize = function (data) {
		const columns = data.split(" ");
		this.resize(columns.length, columns[0].length);
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				if (columns[x][y] === "1") {
					this.activate(x, y);
				} else {
					this.deactivate(x, y);
				}
			}
		}
	};

	Grid.prototype.activate = function (x, y) {
		this.cells[x][y] = new Cell();
	};

	Grid.prototype.deactivate = function (x, y) {
		this.cells[x][y] = null;
	};
	
	Grid.prototype.resize = function (w, h) {
		width = w;
		height = h;
		while (w > this.cells.length) {
			this.cells.push([]);
		}
		this.cells.length = w;
		for (let x = 0; x < w; x++) {
			while (h > this.cells[x].length) {
				this.cells[x].push(new Cell());
			}
			this.cells[x].length = h;
		}
	};
	
	Grid.prototype.buildGenerator = function () {
		const generator = new Generator();
		if (this.buildWords(orientation.horizontal, generator.words) &&
			this.buildWords(orientation.vertical, generator.words)) {
			return generator;
		}
		return null;
	};

	Grid.prototype.addWord = function (orientation, words, a1, a2, b) {
		if (a2 - a1 > 1) {
			const word = new Word();
		
			for (let i = a1; i < a2; i++) {
				const cell = orientation.access.call(this, i, b);
				cell.word = word;
				cell.index = i - a1;
				word.cells.push(cell);
			}
			
			word.candidates = configuration.dictionary.filter(function (string) {
				return string.length == word.cells.length;
			});
			
			if (word.candidates.length == 0) {
				return false;
			}
			
			words.push(word);
		}
		
		return true;
	};

	Grid.prototype.buildWords = function (orientation, words) {
		const length = orientation.major.call(this);
		
		for (let b = 0; b < orientation.minor.call(this); b++) {
			let ax = null;
			
			for (let a = 0; a < length; a++) {
				if (orientation.access.call(this, a, b)) {
					if (ax === null) {
						ax = a;
					}
				} else {
					if (ax !== null) {
						if (!this.addWord(orientation, words, ax, a, b)) {
							return false;
						}
						ax = null;
					}
				}
			}
			
			if (ax !== null) {
				if (!this.addWord(orientation, words, ax, length, b)) {
					return false;
				}
			}
		}
		
		return true;
	};

	function Generator() {
		this.words = [];
		this.levelCount = 0;
		this.totalCount = 0;
	}

	Generator.prototype.generateCandidate = function (word, evaluation) {
		const oldCandidates = [];
		
		for (let i = 0; i < word.cells.length; i++) {
			const otherCell = word.cells[i].other;
			if (otherCell.word) {
				oldCandidates.push(otherCell.word.candidates);
				otherCell.word.candidates = evaluation.others[i];
			} else {
				oldCandidates.push(null);
			}
			word.cells[i].word = null;
		}
		
		const result = this.generate();
		
		for (let i = 0; i < word.cells.length; i++) {
			const otherCell = word.cells[i].other;
			if (otherCell.word) {
				otherCell.word.candidates = oldCandidates[i];
			}
			word.cells[i].word = word;
		}
		
		if (result) {
			for (let i = 0; i < word.cells.length; i++) {
				word.cells[i].cell.character = evaluation.candidate[i];
			}
		}
		
		return result;
	};

	Generator.prototype.generate = function () {
		if (this.words.length == 0) {
			return true;
		}
		
		let minIndex = 0;
		
		for (let i = 0; i < this.words.length; i++) {
			if (this.words[minIndex].candidates.length < this.words[i].candidates.length) {
				minIndex = i;
			}
		}
		
		const word = this.words.splice(minIndex, 1)[0];
		const evaluations = word.buildIndex().evaluate();
		
		let i;
		let result = false;
		
		for (i = 0; !result &&
				i < evaluations.length &&
				this.levelCount < configuration.maxLevel &&
				this.totalCount < configuration.maxTotal; i++) {
			this.totalCount++;
			result = this.generateCandidate(word, evaluations[i]);
			this.levelCount++;
		}
		
		this.levelCount -= result ? 1 : i;
		this.words.splice(minIndex, 0, word);
		return result;
	};
	
	const grid = new Grid();
	
	return {
		getWidth: function () {
			return width;
		},
		
		getHeight: function () {
			return height;
		},
		
		getConfiguration: function () {
			return configuration;
		},
		
		isActive: function (x, y) {
			return !!grid.cells[x][y];
		},
		
		activate: function (x, y) {
			grid.activate(x, y);
		},
		
		deactivate: function (x, y) {
			grid.deactivate(x, y);
		},
		
		resize: function (w, h) {
			grid.resize(w, h);
		},
		
		generate: function () {
			grid.clear();
			const generator = grid.buildGenerator();
			return generator && generator.generate();
		},
		
		clearActive: function () {
			grid.clearActive();
		},
		
		clear: function () {
			grid.clear();
		},
		
		getCharacter: function (x, y) {
			return grid.cells[x][y].character;
		},
		
		serialize: function () {
			return grid.serialize();
		},
		
		deserialize: function (data) {
			grid.deserialize(data);
		}
	};
}
