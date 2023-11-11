import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import defaultThemes from "./themes.json";
import defaultLayouts from "./layouts.json";
// Import init function from "@neutralinojs/lib"
import * as Neutralino from "@neutralinojs/lib"

const root = createRoot(document.getElementById('root'));
try {
    Neutralino.init(); // Add this function call
} catch (e) {
    console.log("init fail")
}

Neutralino.events.on('ready', async () => {


    await ensureConfigExist()
    await Neutralino.window.center()
    // Neutralino.os.showMessageBox('Welcome', 'Hello Neutralinojs');
    // Neutralino.window.bringToFront()

    Neutralino.filesystem.getStats("./config.json")
        .then((data) => {
            console.log(data);
            // Neutralino.os.showMessageBox('Welcome', data.size.toString());
        })
        .catch((err) => {
            Neutralino.filesystem.writeFile("./config.json", JSON.stringify({
                "layout": "default",
                "theme": "default"
            })).then(() => {
                console.log("File created");
            }).catch((err) => {
                console.log(err);
            })
        })

    root.render(<React.StrictMode>
        <App/>
    </React.StrictMode>)


}).catch((err) => {
})


async function ensureConfigExist() {
    const flatCss = `.keyboard-body.flat {
        background-image: radial-gradient(circle at center center, rgb(235 69 69), rgb(198 97 97 / 60%), rgb(100 198 160));
    }
    
    .keyboard-body.flat .keyboard-key {
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: #eee;
        margin-bottom: 4px;
        margin-right: 2px;
        min-width: 60px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.2);
    }
    
    .keyboard-body.flat .keyboard-key.active, .keyboard-body.flat .keyboard-key:hover {
        background: #595556a8;
    }`;
    try {
        await Neutralino.filesystem.getStats("./config")
    } catch (e) {
        await Neutralino.filesystem.createDirectory("./config")
        await Neutralino.filesystem.createDirectory("./config/themes")

        // generate default config
        await Neutralino.filesystem.writeFile("./config/themes.json", JSON.stringify(defaultThemes, null, 2))
        await Neutralino.filesystem.writeFile("./config/layouts.json", JSON.stringify(defaultLayouts, null, 2))
        await Neutralino.filesystem.writeFile("./config/themes/flat.css", flatCss)
    }

    // security check
    // verify themes
}