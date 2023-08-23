import { app, BrowserWindow, globalShortcut } from "electron";
import { sendCustomEvent } from "./main-event";
import * as path from "path";
import { createConfigDb } from "./etv-config";

import { Clock } from "./clock";

const APP_PATH = app.getAppPath();
const INDEX_PATH = path.join(APP_PATH, "index.html");
const CONFIG_PATH = path.join(APP_PATH, "iframe.config.json");
const DB = createConfigDb(CONFIG_PATH);
const TAG = "[ MAIN ]: ";

const { baseUrl, username, password } = DB.readOrThrow();
const loadUrl = baseUrl + "?" + "uid=" + username + "&secret=" + password;
const createNrkWindow = (parent: BrowserWindow) => {
  const win = new BrowserWindow({
    height: 800,
    width: 1200,
    backgroundColor: "red",
    show: false,
    parent,
  });
  return win;
};
const program = async (showDevtools = true) => {
  await app.whenReady();
  const { screen } = require("electron");
  const display = screen.getPrimaryDisplay();
  const { height, width } = display.bounds;
  const allDisplays = screen.getAllDisplays();
  console.log(allDisplays);
  // const window2 = new BrowserWindow({600, width});
  const win = new BrowserWindow({
    height,
    width,
    resizable: false,
    frame: false,
    fullscreenable: true,
    focusable: true,
    // backgroundColor: "black",
    webPreferences: {
      // sandbox: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      // enableRemoteModule: false, // turn off remote
    },
    // kiosk: true,
    // fullscreen: true,
  });
  // win.webContents.focus();
  win.on("show", () => {
    setTimeout(() => {
      console.log("FOCUS");

      // win.setKiosk(true);
      // win.setFullScreen(true);
      // win.webContents.focus();
    }, 1000);
  });
  win.show();
  const win2 = createNrkWindow(win);
  setTimeout(() => {
    win2.show();
    setTimeout(() => {
      win2.loadURL(loadUrl, {});
    }, 5000);
  }, 10000);
  if (showDevtools) {
    win.webContents.openDevTools();
  }

  sendCustomEvent({ kind: "init", password, baseUrl, username }, win);

  win
    .loadFile(INDEX_PATH)
    .then(() => {
      sendCustomEvent({ kind: "init", password, baseUrl, username }, win);
    })
    .catch((e) => {
      console.log(e);
    });

  globalShortcut.register("CommandOrControl+n", () => {
    console.log("[global shortcut] - n )");
    sendCustomEvent({ kind: "next" }, win);
  });

  globalShortcut.register("CommandOrControl+b", () => {
    console.log("[global shortcut] - b");
    sendCustomEvent({ kind: "back" }, win);
  });

  globalShortcut.register("CommandOrControl+q", () => {
    console.log("[global shortcut] - escape");
    app.quit();
  });

  setInterval(() => {
    sendCustomEvent({ kind: "tick" }, win);
  }, 1000);
};

program(true)
  .then(() => {
    console.log("STARTED.");
    const loadTime = Clock.sinceT0MilliAsString();
    console.log(TAG + " program load: " + loadTime);
  })
  .catch((e) => {
    console.log(e);
  });

app.on("window-all-closed", () => {
  app.quit();
});
