function loadLabels() {
	
	const labelData = {
		"c-language": {
			name: "C",
			title: "Geschrieben in der Programmiersprache C"
		},
		"extension": {
			name: "Extension",
			title: "Stellt erweiterte Funktionalität zur Verfügung"
		},
		"game-maker": {
			name: "Game Maker",
			href: "https://www.yoyogames.com/gamemaker",
			title: "Entwickelt mit dem Game Maker von YoYo Games"
		},
		"javascript": {
			name: "JavaScript",
			title: "Geschrieben in JavaScript"
		},
		"sdl": {
			name: "SDL",
			href: "https://www.libsdl.org/",
			title: "Entwickelt mit der Simple DirectMedia Layer Bibliothek"
		},
		"bricklink-studio": {
			name: "BrickLink Studio",
			href: "https://www.bricklink.com/v3/studio/download.page",
			title: "Entworfen mit der LEGO Design Software BrickLink Studio"
		}
	};
	
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-label"),
		function (element) {
			element.className.split(' ').forEach(
				function (name) {
					const data = labelData[name];
					
					if (data) {
						const link = document.createElement("a");
						link.innerText = data.name;
						
						if (data.href) {
							link.href = data.href;
						}
						
						link.title = data.title;
						
						element.appendChild(link);
						element.style.display = "inline-block";
					}
				}
			);
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
}
