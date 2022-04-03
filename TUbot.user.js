// ==UserScript==
// @name         TU Delft/e /r/place Template
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  TU Delft and TU/e clicker
// @author       halfdane (original author)
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @updateURL    https://github.com/ElvinC/rplaceTU/raw/master/TUbot.user.js
// @downloadURL  https://github.com/ElvinC/rplaceTU/raw/master/TUbot.user.js
// @connect      raw.githubusercontent.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/**
 *
 *    Original script by halfdane, modified
 *    TU Delft and TU/e coordination: https://discord.gg/2KAgEuZp
 *
 */

let X_OFFSET = -1 // Default not running until valid coordinates
let Y_OFFSET = 0

async function run() {
    const debug=false;
    const g = (e, t) =>
        new CustomEvent(e, {
            composed: !0,
            bubbles: !0,
            cancelable: !0,
            detail: t,
        });

    function sleep(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    const colors = {
        1: "#BE0039",
        2:  "#FF4500",
        3:  "#FFA800",
        4:  "#FFD635",
        6:  "#00A368",
        7: "#00CC78",
        8:  "#7EED56",
        9: "#00756F",
        10:"#009EAA",
        12: "#2450A4",
        13: "#3690EA",
        14: "#51E9F4",
        15:"#493AC1",
        16:"#6A5CFF",
        18: "#811E9F",
        19: "#B44AC0",
        22: "#FF3881",
        23: "#FF99AA",
        24: "#6D482F",
        25: "#9C6926",
        27: "#000000",
        29: "#898D90",
        30: "#D4D7D9",
        31: "#FFFFFF",
    };

    for (const [k, v] of Object.entries(colors)) {
        colors[v] = k;
    }

    async function get_template_ctx(){
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const template_canvas = document.createElement("canvas");
                template_canvas.width = img.width;
                template_canvas.height = img.height;
                const template_ctx = template_canvas.getContext("2d");
                template_ctx.drawImage(img, 0, 0);
                resolve({template_ctx: template_ctx, template_img: img})
            }
            img.onerror = reject
            img.src = "https://raw.githubusercontent.com/ElvinC/rplaceTU/master/TU.png?tstamp=" + Math.floor(Date.now() / 10000);
        })
    }

    function getPixel(ctx, x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1);
        const data = pixel.data;
        return ([("#" + data[0].toString(16).padStart(2, 0) + data[1].toString(16).padStart(2, 0) + data[2].toString(16).padStart(2, 0)).toUpperCase(), data[3] !== 0]

        );
    }

    async function setPixel(canvas, x, y, color) {
        canvas.dispatchEvent(g("click-canvas", { x, y }));
        await sleep(1_000+ Math.floor(Math.random() * 1_000));
        canvas.dispatchEvent(g("select-color", { color: 1*colors[color] }));
        await sleep(1_000+ Math.floor(Math.random() * 1_000));
        if (!debug){
            canvas.dispatchEvent(g("confirm-pixel"));
        }
    }

    GM_xmlhttpRequest({
        method: "GET",
        url: "https://raw.githubusercontent.com/ElvinC/rplaceTU/master/coords.txt?tstamp=" + Math.floor(Date.now() / 10000),
        onload: function(response) {
            let splitString = response.responseText.split(",");
            console.log(splitString)
            X_OFFSET = parseInt(splitString[0]);
            Y_OFFSET = parseInt(splitString[1]);
            console.log("UPDATED OFFSET");
            console.log(X_OFFSET + "," + Y_OFFSET);
            if (X_OFFSET != -1) {
                console.log("VALID COORDINATES RECEIVED")
            }
        }
    });

    await sleep(5_000);

    while (true) {
        console.log("running");
        let edited = false;
        try{
            const {template_ctx, template_img} = await get_template_ctx();

            const ml = document.querySelector("mona-lisa-embed");
            const canvas = ml.shadowRoot.querySelector("mona-lisa-canvas").shadowRoot.querySelector("div > canvas")
            const ctx = canvas.getContext('2d');
            const errors = []
            for (let x = 0; x < template_img.width; x++) {
                for (let y = 0; y < template_img.height; y++) {
                    let ref_pixel = getPixel(template_ctx, x, y);
                    let correct = ref_pixel[0];
                    let actual = getPixel(ctx, x+X_OFFSET, y+Y_OFFSET)[0];
                    if (actual !== correct && ref_pixel[1]) { // ignore transparent pixels
                        errors.push({x: x+X_OFFSET, y: y+Y_OFFSET, correct: correct, actual: actual});
                    }
                }
            }

            if (X_OFFSET == -1) {
                console.log("Invalid coordinate, not placing pixels")
            }
            else if (errors.length > 0) {
                var e = errors[Math.floor(Math.random()*errors.length)];

                console.log("(%s / %s) is %c%s%c but should be %c%s", e.x, e.y,
                    "background:"+e.actual, e.actual, "background:inherit;",
                    "background:"+e.correct, e.correct
                )

                await setPixel(canvas, e.x, e.y, e.correct);
                if (!debug){
                    edited = true;
                }
            }

        } catch (error){
            console.log("ignoring", error);
        } finally {
            let timeout;
            if (edited) {
                timeout = 1_000 * 60 * 5 + 5_000 + Math.floor(Math.random() * 15_000);
            } else {
                timeout =Math.floor(Math.random() * 5_000);
            }
            if (debug){
                timeout = 1;
            }
            console.log("sleeping for ", timeout);
            await sleep(timeout);
        }
    }
}

window.addEventListener('load', run);