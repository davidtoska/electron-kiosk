import { BrowserWindow } from "electron";

export const createOnlineWindow = (
  height: number,
  width: number,
  parent: BrowserWindow,
) => {
  const win = new BrowserWindow({
    height,
    width,
    backgroundColor: "gray",
    show: false,
    parent,
  });
  return win;
};

export const createOfflineWindow = (height: number, width: number) => {
  const win = new BrowserWindow({
    height,
    width,
    resizable: false,
    // frame: false,
    fullscreenable: true,
    focusable: true,
    backgroundColor: "black",
    webPreferences: {
      // sandbox: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      // enableRemoteModule: false, // turn off remote
    },
    // kiosk: true,
    // fullscreen: true,
  });
  return win;
};
