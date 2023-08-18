import { app, BrowserWindow, globalShortcut } from "electron";
import { sendCustomEvent } from "./main-event";
import * as path from "path";
import { createConfigDb } from "./etv-config";

const APP_PATH = app.getAppPath();
const INDEX_PATH = path.join(APP_PATH, "index.html");
const CONFIG_PATH = path.join(APP_PATH, "iframe.config.json");
const DB = createConfigDb(CONFIG_PATH);

const { baseUrl, username, password } = DB.readOrThrow();

const program = async (showDevtools = true) => {
  await app.whenReady();
  const win = new BrowserWindow({
    webPreferences: {
      sandbox: true,
      nodeIntegration: false, // is default value after Electron v5
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

  await globalShortcut.register("CommandOrControl+q", () => {
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
  })
  .catch((e) => {
    console.log(e);
  });

app.on("window-all-closed", () => {
  app.quit();
});
