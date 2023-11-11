import {useEffect, useRef, useState} from 'react'
import './App.scss';

// Import filesystem namespace
import Keyboard from "./KeyBoard";
import iconSetting from "./assets/icon-setting.svg";
import iconClose from "./assets/icon-close.svg";
import iconPin from "./assets/icon-pin.svg";
import * as Neutralino from "@neutralinojs/lib"


function App() {
    const [activeKeys, setActiveKeys] = useState([])
    const [keysHistory, setKeysHistory] = useState([])
    const [keyboardTheme, setKeyboardTheme] = useState('default')
    const [themes, setThemes] = useState([])
    const [layoutConfigName, setLayoutConfigName] = useState("builtin");
    const [isSettingShow, setIsSettingShow] = useState(false);
    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
    const [layoutConfigs, setLayoutConfigNames] = useState([]);
    useEffect(() => {
        const historyCapacity = 2
        if (activeKeys.length > 0) {
            setKeysHistory((keysHistory) => {
                if (keysHistory.length >= historyCapacity) {
                    keysHistory.shift()
                }
                return [...keysHistory, activeKeys]
            })
        }
    }, [activeKeys])

    async function loadThemes() {
        try {
            const themes = await Neutralino.filesystem.readFile("./config/themes.json")
            const data = JSON.parse(themes)
            await Promise.all(
                data.map(async (theme) => {
                    if (theme.files) {
                        await Promise.all(
                            theme.files.map(async (file) => {
                                if (file.endsWith('.css')) {
                                    // check if file exists
                                    try {
                                        await Neutralino.filesystem.getStats(file)
                                    } catch (e) {
                                        return;
                                    }
                                    try {
                                        const fileContent = await Neutralino.filesystem.readFile(file)
                                        const style = document.createElement('style')
                                        style.innerHTML = fileContent
                                        document.head.appendChild(style)
                                    } catch (e) {

                                    }
                                } else if (file.endsWith('.js')) {
                                    try {
                                        const fileContent = await Neutralino.filesystem.readFile(file)
                                        const script = document.createElement('script')
                                        script.innerHTML = fileContent
                                        document.head.appendChild(script)
                                        // inject css
                                    } catch (e) {

                                    }
                                }
                            })
                        )
                    }
                })
            )
            setThemes(data)
        } catch (e) {
            return []
        }
    }

    async function loadLayouts() {
        try {
            const layouts = await Neutralino.filesystem.readFile("./config/layouts.json")
            const data = JSON.parse(layouts)
            setLayoutConfigNames(data)
        } catch (e) {
            return []
        }
    }

    useEffect(() => {

        function keyDown(e) {
            //save pressed keys
            const key = e.key
            setActiveKeys((activeKeys) => {
                if (activeKeys.indexOf(key) === -1) {
                    return [...activeKeys, key]
                }
                return activeKeys
            })
        }

        function keyUp(e) {
            const key = e.key
            setActiveKeys((activeKeys) => {
                return activeKeys.filter((activeKey) => activeKey !== key)
            });
        }

        window.addEventListener("keydown", keyDown)
        window.addEventListener("keyup", keyUp)
        Promise.all(
            [
                loadThemes(),
                loadLayouts()
            ]
        ).then(() => {
            setLayoutConfigName((current) => {
                if (!layoutConfigs.map(x => x.name).includes(current)) {
                    if (layoutConfigs.length > 0) {
                        return layoutConfigs[0].name
                    }
                }
                return current
            })
            setKeyboardTheme((keyboardTheme) => {
                if (!themes.includes(keyboardTheme)) {
                    if (themes.length > 0) {
                        return themes[0].name
                    }
                }
                return keyboardTheme
            })
        })


        return () => {
            window.removeEventListener('keydown', keyDown)
            window.removeEventListener('keyup', keyUp)
        }
    }, [])

    // useEffect(() => {
    //     // once keyboardTheme is changed, add/remove theme files on the page
    //     const {name, files} = keyboardTheme
    //     const themeFiles = files || []
    //     themeFiles.forEach((file) => {
    //         if (!document.querySelector(`link[href="${file}"]`)) {
    //             const link = document.createElement('link')
    //             link.href = file
    //             link.rel = 'stylesheet'
    //             link.className = 'theme-file'
    //             document.head.appendChild(link)
    //         }
    //     })
    // }, [keyboardTheme])
    const refApp = useRef(null)

    useEffect(() => {
        if (!refApp.current) {
            return
        }
        // refApp.current.focus()

        const appSize = refApp.current.getBoundingClientRect()
        // set window size
        Neutralino.window.setSize({
            width: appSize.width,
            height: appSize.height,
            resizable: false
        })
        // set draggable region
        Neutralino.window.setDraggableRegion(refApp.current).catch((e) => {
            console.log(e)
        })
    })
    return (
        <>
            <div className="App" ref={refApp}>
                {/*<div id="debug"></div>*/}
                <>
                    {
                        isSettingShow

                        &&

                        <div className="keyboard-settings">
                            <div className="keyboard-setting">
                                <div>Layout</div>

                                <div className="keyboard-layouts">
                                    {
                                        layoutConfigs.map((item) => {
                                            return <button
                                                key={item.name}
                                                className={
                                                    "keyboard-layout" + (item.name === layoutConfigName ? ' active' : '')
                                                }
                                                onClick={() => {
                                                    setLayoutConfigName(item.name)
                                                }}>{item.name}</button>
                                        })
                                    }
                                </div>
                            </div>
                            <div className="keyboard-setting">
                                <div>Theme</div>
                                <div className="key-board-themes">
                                    {
                                        themes.map(x => {
                                            return <button
                                                className={
                                                    "key-board-theme" + (keyboardTheme === x.name ? ' active' : '')
                                                }
                                                key={x.name}
                                                onClick={() => {
                                                    setKeyboardTheme(x.name)
                                                }}>{x.name}</button>
                                        })
                                    }
                                </div>
                            </div>

                        </div>
                    }
                </>
                <Keyboard
                    keyboardLayouts={layoutConfigs.find(x => x.name === layoutConfigName)?.layout}
                    theme={keyboardTheme}
                    activeKeys={activeKeys}>
                    <div id="bar" className="bar">
                        <div
                            onClick={
                                () => {
                                    setIsSettingShow(!isSettingShow)
                                }}
                            className="bar-btn keyboard-setting-icon">
                            <img src={iconSetting} alt=""/>
                        </div>
                        <div
                            onClick={
                                () => Neutralino.app.exit(0)
                            }
                            className="bar-btn btn-close">
                            <img src={iconClose} alt=""/>
                        </div>
                        <div
                            onClick={
                                async () => {
                                    await Neutralino.window.setAlwaysOnTop(!isAlwaysOnTop);
                                    setIsAlwaysOnTop(!isAlwaysOnTop);
                                }
                            }

                            className="bar-btn btn-pin">
                            <img src={iconPin}
                                 style={

                                     isAlwaysOnTop ? {
                                         transform: 'rotate(-90deg)'
                                     } : {}}
                                 alt=""/>
                        </div>
                    </div>

                </Keyboard>


                {/*<div className="key-histories">*/}
                {/*    {*/}
                {/*        keysHistory.map((keys, index) => {*/}
                {/*            return <div*/}
                {/*                className={'history-keys'}*/}
                {/*                key={index}>*/}
                {/*                {*/}
                {/*                    keys.map((key, index) => {*/}
                {/*                            return <button*/}
                {/*                                className="history-key"*/}
                {/*                                key={index}>{key}</button>*/}
                {/*                        }*/}
                {/*                    )*/}
                {/*                }*/}
                {/*            </div>*/}
                {/*        })}*/}
                {/*</div>*/}
                {/*<div className="active-keys">*/}
                {/*    {*/}
                {/*        activeKeys.map((key, index) => {*/}
                {/*                return <span*/}
                {/*                    className="active-key"*/}
                {/*                    key={index}>{key}</span>*/}
                {/*            }*/}
                {/*        )*/}
                {/*    }*/}
                {/*</div>*/}
            </div>

        </>
    );
}

export default App;