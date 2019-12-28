window.onload = function() {
	
	const labelData = {
		"c-language": {
			name: "C",
			href: "https://en.wikipedia.org/wiki/C_(programming_language)"
		},
		"extension": {
			name: "Extension"
		},
		"game-maker": {
			name: "Game Maker",
			href: "https://www.yoyogames.com/gamemaker"
		},
		"javascript": {
			name: "JavaScript",
			href: "https://en.wikipedia.org/wiki/JavaScript"
		},
		"sdl": {
			name: "SDL",
			href: "https://www.libsdl.org/"
		}
	};
	
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-label"),
		function(element) {
			element.className.split(' ').forEach(
				function(name) {
					if (labelData[name]) {
						if (labelData[name].href) {
							const link = document.createElement("a");
							link.href = labelData[name].href;
							link.innerText = labelData[name].name;
							element.appendChild(link);
						} else {
							element.appendChild(document.createTextNode(labelData[name].name));
						}
					}
				}
			);
		}
	);
}
