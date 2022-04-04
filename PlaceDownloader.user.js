// ==UserScript==
// @name         /r/place canvas downloader
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  /r/place canvas downloader
// @author       Elvin
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @updateURL    https://github.com/ElvinC/rplaceTU/raw/master/PlaceDownloader.user.js
// @downloadURL  https://github.com/ElvinC/rplaceTU/raw/master/PlaceDownloader.user.js
// @grant        none
// ==/UserScript==

/**
 *
 *    modified from script by halfdane
 *    TU Delft and TU/e coordination: https://discord.gg/2KAgEuZp
 *
 */

async function run() {
    function sleep(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }
    let monl = document.querySelector("mona-lisa-embed");

    monl.insertAdjacentHTML('afterend','<div id="download-btn" style="position: fixed;cursor:pointer;left: 5px;top: 134px;background-color: #334455;color: white;padding: 12px;font-size: 13px;opacity: 0.8;border-radius: 10px;">Download canvas</div>')

    await sleep(1000);
    let down_btn = document.querySelector("#download-btn");
    down_btn.addEventListener("click", function() {
        console.log("Saving image...")
        let ml = document.querySelector("mona-lisa-embed");
        let canvas = ml.shadowRoot.querySelector("mona-lisa-canvas").shadowRoot.querySelector("div > canvas");
        const link = document.createElement('a');
        link.download = 'download.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        link.delete;
    });
}

window.addEventListener('load', run);