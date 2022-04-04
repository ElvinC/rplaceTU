// ==UserScript==
// @name         TU Delft/e /r/place bot
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  TU Delft and TU/e clicker
// @author       halfdane (original author), elvin
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
 *    modified from script by halfdane
 *    TU Delft and TU/e coordination: https://discord.gg/2KAgEuZp
 *
 */

let X_OFFSET = -1 // Default not running until valid coordinates
let Y_OFFSET = 0

let bot_running = false;

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
        0:  "#6D001A",
        1:  "#BE0039",
        2:  "#FF4500",
        3:  "#FFA800",
        4:  "#FFD635",
        5:  "#FFF8B8",
        6:  "#00A368",
        7:  "#00CC78",
        8:  "#7EED56",
        9:  "#00756F",
        10: "#009EAA",
        11: "#00CCC0",
        12: "#2450A4",
        13: "#3690EA",
        14: "#51E9F4",
        15: "#493AC1",
        16: "#6A5CFF",
        17: "#94B3FF",
        18: "#811E9F",
        19: "#B44AC0",
        20: "#E4ABFF",
        21: "#DE107F",
        22: "#FF3881",
        23: "#FF99AA",
        24: "#6D482F",
        25: "#9C6926",
        26: "#FFB470",
        27: "#000000",
        28: "#515252",
        29: "#898D90",
        30: "#D4D7D9",
        31: "#FFFFFF",
    };

    for (const [k, v] of Object.entries(colors)) {
        colors[v] = k;
    }


    function update_coords() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://raw.githubusercontent.com/ElvinC/rplaceTU/master/coords_new.txt?tstamp=" + Math.floor(Date.now() / 10000),
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
        await sleep(600+ Math.floor(Math.random() * 1_000));
        canvas.dispatchEvent(g("select-color", { color: 1*colors[color] }));
        console.log(canvas)
        await sleep(600+ Math.floor(Math.random() * 1_000));
        if (!debug && bot_running){
            canvas.dispatchEvent(g("confirm-pixel"));
        }
    }
    update_coords();

    await sleep(1000)
    let monl = document.querySelector("mona-lisa-embed");

    monl.insertAdjacentHTML('afterend','<div id="start-auto-btn" style="position: fixed;cursor:pointer;left: 5px;top: 74px;background-color: #334455;color: white;padding: 12px;font-size: 13px;opacity: 0.8;border-radius: 10px;">Start bot</div>')

    window.setInterval(update_coords, 300000);

    let can_place = false;
    let toggle_history = false;

    await sleep(1_000);
    let bot_btn = document.querySelector("#start-auto-btn");
    bot_btn.addEventListener("click", function() {
        bot_running = !bot_running;
        console.log(bot_running ? "Starting bot" : "Stopping bot")
        this.innerHTML = bot_running ? "Stop bot": "Start bot"
    });

    await sleep(5_000);

    function stop_bot() {
        console.log("Something could be wrong... stopping bot")
        bot_running = false;
        bot_btn.innerHTML = bot_running ? "Stop bot": "Start bot";
    }

    

    while (true) {
        console.log("running");
        let edited = false;
        try{
            let {template_ctx, template_img} = await get_template_ctx();

            let ml = document.querySelector("mona-lisa-embed");

            let canvas = ml.shadowRoot.querySelector("mona-lisa-canvas").shadowRoot.querySelector("div > canvas")
            let timer = ml.shadowRoot.querySelector("mona-lisa-status-pill")

            let pill_thing = timer.shadowRoot.querySelector(".pill");
            let remaining_time = timer.getAttribute("next-tile-available-in");
            let sleep_timeout = remaining_time * 1000 + Math.random() * 5_000 + 3_000;

            can_place = false;

            if (pill_thing.innerHTML.trim() == "Place a tile") {
                can_place = true;
            } else if (sleep_timeout > 0){
                console.log(remaining_time + " seconds remaining... sleeping...");
                await sleep(sleep_timeout);
            } else {
                stop_bot()
            }

            ml = document.querySelector("mona-lisa-embed");
            canvas = ml.shadowRoot.querySelector("mona-lisa-canvas").shadowRoot.querySelector("div > canvas")
            pill_thing = timer.shadowRoot.querySelector(".pill");

            if (pill_thing.innerHTML.trim() == "Place a tile") {
                can_place = true;
                console.log("Can now place pixels")
            }
            else {
                console.log("Still can't place")
            }

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
                console.log("Invalid coordinate, not placing pixels. Retrying in 60 seconds")
                await sleep(60000);
            }
            else if (errors.length > 0 && can_place) {
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
                //timeout = 1_000 * 60 * 5 + 5_000 + Math.floor(Math.random() * 15_000);
                timeout = 10000;
            } else {
                timeout =10000 + Math.floor(Math.random() * 3_000);
            }
            if (debug){
                timeout = 1000;
            }
            console.log("sleeping for ", timeout);
            await sleep(timeout);

            // Should've placed pixel, check if timer is up
            if (can_place && toggle_history) {
                const ml = document.querySelector("mona-lisa-embed");
                const timer = ml.shadowRoot.querySelector("mona-lisa-status-pill")

                const pill_thing = timer.shadowRoot.querySelector(".pill");
                let remaining_time = timer.getAttribute("next-tile-available-in");

                if (!(remaining_time > 0)) {
                    stop_bot();
                }
            }
            toggle_history = bot_running;
        }
    }
}

window.addEventListener('load', run);