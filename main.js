window.onload = function() {
	
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
		}
	};
	
	Array.prototype.forEach.call(
		document.getElementsByClassName("project-label"),
		function(element) {
			element.className.split(' ').forEach(
				function(name) {
					const data = labelData[name];
					
					if (data) {
						const link = document.createElement("a");
						link.innerText = data.name;
						
						if (data.href) {
							link.href = data.href;
						}
						
						link.title = data.title;
						element.appendChild(link);
					}
				}
			);
		}
	);
}
