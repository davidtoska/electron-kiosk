import { app, BrowserWindow, globalShortcut } from "electron";
import { sendCustomEvent } from "./win-utils";
const pickArgOrThrow = (argName: string) => {
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
const program = async (showDevtools = true) => {
  await app.whenReady();
  const win = new BrowserWindow({
    webPreferences: {
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
  sendCustomEvent(INIT, win);

  win
    .loadURL(loadUrl)
    .then(() => {
      console.log("Index.html loaded.");
      sendCustomEvent(INIT, win);
    })
    .catch((err: unknown) => {
      console.log(err);
    });

  globalShortcut.register("CommandOrControl+n", () => {
    console.log("[global shortcut] - n )");
    sendCustomEvent(NEXT, win);
  });

  globalShortcut.register("CommandOrControl+b", () => {
    console.log("[global shortcut] - b");
    sendCustomEvent(BACK, win);
  });

  await globalShortcut.register("CommandOrControl+q", () => {
    console.log("[global shortcut] - escape");
    app.quit();
  });
  setInterval(() => {
    sendCustomEvent(TICK, win);
  }, 1000);
};

program(false)
  .then(() => {
    console.log("STARTED.");
  })
  .catch((e) => {
    console.log(e);
  });

app.on("window-all-closed", () => {
  app.quit();
});
