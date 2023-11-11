import {useState} from "react";
import iconSetting from "./assets/icon-setting.svg";

const keyStyles = {
    Tab: {width: '80px'},
    Shift: {width: '150px'},
    Space: {width: '500px'},
    Backspace: {width: '100px'},
    CapsLock: {width: '100px'},
    Enter: {width: '100px'},
    Control: {width: '100px'},
    '\\': {width: '80px'}, // ... add other keys as needed
};
export default function Keyboard(props) {
    const activeKeys = props.activeKeys || [];
    const theme = props.theme || 'default';
    const keyboardLayouts = props.keyboardLayouts || {};
    const children = props.children;
    // render a keyboard
    const handleKeyClick = (e) => {
        // ignore events and stop propagation
        e.preventDefault();
        e.stopPropagation();
        // prevent default behavior


    }
    return (<div className={"keyboard-container " + (theme === 'default' ? '' : ' ' + theme)}>
        {children}
        <div className={"keyboard-body " + (theme === 'default' ? '' : ' ' + theme)}>
            {
                Object.keys(keyboardLayouts).map((layoutKey, index) => {
                    return <div key={layoutKey} className={
                        "keyboard-rows " + layoutKey
                    }>
                        {keyboardLayouts[layoutKey].map((row, rowIndex) => {
                            return <div
                                className={
                                    "keyboard-row"
                                }
                                key={rowIndex}>
                                {row.map((item, keyIndex) => {
                                    const {code, display, tip} = item;
                                    const keyStyle = {
                                        zIndex: rowIndex, ...(keyStyles[code] || {})
                                    };
                                    return <div
                                        className={"keyboard-key " + (activeKeys.includes(code) ? ' active ' : ' ') + "key_" + code.toLowerCase()}
                                        style={keyStyle}
                                        onClick={handleKeyClick}
                                        key={keyIndex}>{display}
                                        <span className="keyboard-key-tip">{tip}</span>
                                    </div>
                                })}
                            </div>
                        })}
                    </div>
                })
            }
        </div>
    </div>)
}