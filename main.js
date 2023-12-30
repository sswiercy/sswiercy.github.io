const DATE_FORMAT = new Intl.DateTimeFormat(
	"de-DE",
	{
		"year": "numeric",
		"month": "2-digit",
		"day": "2-digit"
	}
);

function linkModifier(name, title, href) {
	return function (element) {
		const a = document.createElement("a");
		a.innerText = name;
		a.title = title;
		
		if (href) {
			a.href = href;
		}
		
		element.appendChild(a);
	};
}

function releaseDateModifier(element) {
	const date = new Date(
		element.getAttribute("data-year"),
		element.getAttribute("data-month") - 1,
		element.getAttribute("data-day")
	);
	linkModifier(
		DATE_FORMAT.format(date),
		"Veröffentlichungsdatum"
	)(element);
}

const LABEL_MODIFIERS = {
	"release-date": releaseDateModifier,
	"c-language": linkModifier(
		"C",
		"Geschrieben in der Programmiersprache C"
	),
	"extension": linkModifier(
		"Extension",
		"Stellt erweiterte Funktionalität zur Verfügung"
	),
	"game-maker": linkModifier(
		"Game Maker",
		"Entwickelt mit dem Game Maker von YoYo Games",
		"https://www.yoyogames.com/gamemaker"
	),
	"javascript": linkModifier(
		"JavaScript",
		"Geschrieben in JavaScript"
	),
	"sdl": linkModifier(
		"SDL",
		"Entwickelt mit der Simple DirectMedia Layer Bibliothek",
		"https://www.libsdl.org/"
	),
	"bricklink-studio": linkModifier(
		"BrickLink Studio",
		"Entworfen mit der LEGO Design Software BrickLink Studio",
		"https://www.bricklink.com/v3/studio/download.page"
	)
};

function loadLabels() {
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-label"),
		function (element) {
			element.className.split(' ').forEach(
				function (name) {
					const modifier = LABEL_MODIFIERS[name];
					if (modifier) {
						modifier(element);
					}
				}
			);
			element.style.display = "inline-block";
		}
	);
}

const galleryController = (function () {
	
	let images;
	let index;
	
	function Image(title, url) {
		this.title = title;
		this.url = url;
	}
	
	function showGallery() {
		document.getElementById("gallery").style.display = "block";
	}
	
	function updateTitle() {
		document.getElementById("gallery-title").innerText = images[index].title;
	}
	
	function updateCounter() {
		document.getElementById("gallery-counter").innerText = (index + 1) + " / " + images.length;
	}
	
	function updateImage() {
		const content = document.getElementById("gallery-content");
		
		const img = document.createElement("img");
		const a = document.createElement("a");
		
		img.alt = images[index].title;
		img.src = images[index].url;
		
		a.href = images[index].url;
		a.appendChild(img);
		
		if (content.firstChild) {
			content.removeChild(content.firstChild);
		}
		
		content.appendChild(a);
	}
	
	function update() {
		updateTitle();
		updateCounter();
		updateImage();
	}
	
	return {
		load: function () {
			Array.prototype.forEach.call(
				document.getElementsByClassName("project-images"),
				function (projectImages) {
					const myImages = [];
					Array.prototype.forEach.call(
						projectImages.getElementsByTagName("img"),
						function (img, myIndex) {
							myImages.push(new Image(img.alt, img.getAttribute("data-large")));
							img.title = img.alt;
							img.onclick = function () {
								images = myImages;
								index = myIndex;
								showGallery();
								update();
							};
						}
					);
				}
			);
		},
		
		previous: function () {
			if (!index) {
				index = images.length;
			}
			--index;
			update();
		},
		
		next: function () {
			++index;
			if (index >= images.length) {
				index = 0;
			}
			update();
		},
		
		hide: function () {
			document.getElementById("gallery").style.display = "none";
		}
	};
})();

window.onload = function () {
	loadLabels();
	galleryController.load();
};
