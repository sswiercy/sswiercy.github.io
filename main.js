function Labels(modifiers) {
	this.modifiers = modifiers;
}

Labels.linkModifier = function (name, title, href) {
	return function (element) {
		const a = document.createElement("a");
		a.innerText = name;
		a.title = title;
		
		if (href) {
			a.href = href;
		}
		
		element.appendChild(a);
	};
};

Labels.releaseDateModifier = function (element) {
	const date = new Date(
		element.getAttribute("data-year"),
		element.getAttribute("data-month") - 1,
		element.getAttribute("data-day")
	);
	Labels.linkModifier(
		Labels.DATE_FORMAT.format(date),
		"Veröffentlichungsdatum"
	)(element);
};

Labels.DATE_FORMAT = new Intl.DateTimeFormat(
	"de-DE",
	{
		"year": "numeric",
		"month": "2-digit",
		"day": "2-digit"
	}
);

Labels.MODIFIERS = {
	"release-date": Labels.releaseDateModifier,
	"c-language": Labels.linkModifier(
		"C",
		"Geschrieben in der Programmiersprache C"
	),
	"extension": Labels.linkModifier(
		"Extension",
		"Stellt erweiterte Funktionalität zur Verfügung"
	),
	"game-maker": Labels.linkModifier(
		"Game Maker",
		"Entwickelt mit dem Game Maker von YoYo Games",
		"https://www.yoyogames.com/gamemaker"
	),
	"javascript": Labels.linkModifier(
		"JavaScript",
		"Geschrieben in JavaScript"
	),
	"sdl": Labels.linkModifier(
		"SDL",
		"Entwickelt mit der Simple DirectMedia Layer Bibliothek",
		"https://www.libsdl.org/"
	),
	"bricklink-studio": Labels.linkModifier(
		"BrickLink Studio",
		"Entworfen mit der LEGO Design Software BrickLink Studio",
		"https://www.bricklink.com/v3/studio/download.page"
	)
};

Labels.prototype.load = function () {
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-label"),
		function (element) {
			element.className.split(' ').forEach(
				function (name) {
					const modifier = this.modifiers[name];
					if (modifier) {
						modifier(element);
					}
				}.bind(this)
			);
			element.style.display = "inline-block";
		}.bind(this)
	);
};

function Gallery() {
	this.data;
	this.index;
}

Gallery.prototype.selected = function () {
	return this.data[this.index];
};

Gallery.prototype.open = function () {
	document.getElementById("gallery").style.display = "block";
};

Gallery.prototype.close = function () {
	document.getElementById("gallery").style.display = "none";
};

Gallery.prototype.updateTitle = function () {
	document.getElementById("gallery-title").innerText = this.selected().title;
};

Gallery.prototype.updateCounter = function () {
	document.getElementById("gallery-counter").innerText = (this.index + 1) + " / " + this.data.length;
};

Gallery.prototype.updateImage = function () {
	const content = document.getElementById("gallery-content");
		
	const img = document.createElement("img");
	const a = document.createElement("a");
	
	img.alt = this.selected().title;
	img.src = this.selected().url;
	
	a.href = this.selected().url;
	a.appendChild(img);
	
	if (content.firstChild) {
		content.removeChild(content.firstChild);
	}
	
	content.appendChild(a);
};

Gallery.prototype.update = function () {
	this.updateTitle();
	this.updateCounter();
	this.updateImage();
};

Gallery.prototype.load = function () {
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-images"),
		function (projectImages) {
			const projectData = [];
			Array.prototype.forEach.call(
				projectImages.getElementsByTagName("img"),
				function (img, projectIndex) {
					projectData.push(
						{
							title: img.alt,
							url: img.getAttribute("data-large")
						}
					);
					img.title = img.alt;
					img.onclick = function () {
						this.data = projectData;
						this.index = projectIndex;
						this.open();
						this.update();
					}.bind(this);
				}.bind(this)
			);
		}.bind(this)
	);
	this.register();
};

Gallery.prototype.register = function () {
	document.getElementById("gallery-previous-button").onclick = this.previous.bind(this);
	document.getElementById("gallery-next-button").onclick = this.next.bind(this);
	document.getElementById("gallery-close-button").onclick = this.close.bind(this);
};

Gallery.prototype.previous = function () {
	if (!this.index) {
		this.index = this.data.length;
	}
	--this.index;
	this.update();
};

Gallery.prototype.next = function () {
	++this.index;
	if (this.index >= this.data.length) {
		this.index = 0;
	}
	this.update();
};

window.onload = function () {
	new Labels(Labels.MODIFIERS).load();
	new Gallery().load();
};
