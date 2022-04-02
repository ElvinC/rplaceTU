// ==UserScript==
// @name         TU Delft/e /r/placea Template
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  TU Delft and TU/e Template
// @author       /u/fiercedude and updated by /u/byteyotta
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @updateURL    https://github.com/elvinc/rplaceTU/raw/main/TU.user.js
// @downloadURL  https://github.com/elvinc/rplaceTU/raw/main/TU.user.js
// @grant        none
// ==/UserScript==

/**
 *
 *    Original script by /u/fiercedude
 * 	  TU Delft and TU/e coordination: https://discord.gg/2KAgEuZp
 *
 */

if (window.top !== window.self) {
	window.addEventListener(
		"load",
		() => {
			document
				.getElementsByTagName("mona-lisa-embed")[0]
				.shadowRoot.children[0].getElementsByTagName("mona-lisa-canvas")[0]
				.shadowRoot.children[0].appendChild(
					(function () {
						const i = document.createElement("img");
						const cacheCode = Math.floor(Date.now() / 100000);
						i.src =
							"https://raw.githubusercontent.com/elvinc/rplacespace/main/TU_template.png?cache=" +
							cacheCode;
						i.style =
							"position: absolute;left: 0;top: 0;image-rendering: pixelated;width: 2000px;height: 1000px;";
						console.log(i);
						return i;
					})()
				);
		},
		false
	);
}
