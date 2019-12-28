window.onload = function() {
	
	const labelData = {
		"c-language": {
			name: "C",
			title: "Written in the C programming language"
		},
		"extension": {
			name: "Extension",
			title: "Provides extended functionality"
		},
		"game-maker": {
			name: "Game Maker",
			href: "https://www.yoyogames.com/gamemaker",
			title: "Developed using the Game Maker by YoYo Games"
		},
		"javascript": {
			name: "JavaScript",
			title: "Written in JavaScript"
		},
		"sdl": {
			name: "SDL",
			href: "https://www.libsdl.org/",
			title: "Developed using the Simple DirectMedia Layer"
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
