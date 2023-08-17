"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCustomEvent = void 0;
const sendCustomEvent = (message, window) => {
    const asJson = JSON.stringify(message);
    const code = `
    (function () {
        const customEvent = new CustomEvent("eventFromMain", { detail: ${asJson}});
        window.dispatchEvent(customEvent);
     })();`;
    window.webContents
        .executeJavaScript(code, true)
        .then(() => { })
        .catch((e) => {
        console.log(e);
    });
};
exports.sendCustomEvent = sendCustomEvent;
