"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const win_utils_1 = require("./win-utils");
const pickArgOrThrow = (argName) => {
    const args = [...process.argv];
    const searchString = argName + "=";
    const all = args.filter((a) => a.includes(searchString));
    const first = all[0];
    if (!first) {
        throw new Error("Missing " + argName);
    }
    const value = first.split("=")[1];
    if (typeof value !== "string") {
        throw new Error("Invalid value of arg: " + argName);
    }
    if (value.length === 0) {
        throw new Error("" + argName + " can not be a empty string;");
    }
    return value;
};
const url = pickArgOrThrow("url");
const username = pickArgOrThrow("username");
const password = pickArgOrThrow("password");
const NEXT = { kind: "NEXT" };
const BACK = { kind: "BACK" };
const TICK = { kind: "TICK" };
const INIT = { kind: "INIT", url, username, password };
const loadUrl = url + "?" + "uid=" + username + "&secret=" + password;
const program = (showDevtools = true) => __awaiter(void 0, void 0, void 0, function* () {
    yield electron_1.app.whenReady();
    const win = new electron_1.BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, // protect against prototype pollution
            // enableRemoteModule: false, // turn off remote
        },
        kiosk: true,
        fullscreen: true,
    });
    // win.webContents.focus();
    win.on("show", () => {
        setTimeout(() => {
            console.log("FOCUS");
            win.webContents.focus();
        }, 1000);
    });
    win.show();
    if (showDevtools) {
        win.webContents.openDevTools();
    }
    (0, win_utils_1.sendCustomEvent)(INIT, win);
    win
        .loadURL(loadUrl)
        .then(() => {
        console.log("Index.html loaded.");
        (0, win_utils_1.sendCustomEvent)(INIT, win);
    })
        .catch((err) => {
        console.log(err);
    });
    electron_1.globalShortcut.register("CommandOrControl+n", () => {
        console.log("[global shortcut] - n )");
        (0, win_utils_1.sendCustomEvent)(NEXT, win);
    });
    electron_1.globalShortcut.register("CommandOrControl+b", () => {
        console.log("[global shortcut] - b");
        (0, win_utils_1.sendCustomEvent)(BACK, win);
    });
    yield electron_1.globalShortcut.register("CommandOrControl+q", () => {
        console.log("[global shortcut] - escape");
        electron_1.app.quit();
    });
    setInterval(() => {
        (0, win_utils_1.sendCustomEvent)(TICK, win);
    }, 1000);
});
program(false)
    .then(() => {
    console.log("STARTED.");
})
    .catch((e) => {
    console.log(e);
});
electron_1.app.on("window-all-closed", () => {
    electron_1.app.quit();
});
