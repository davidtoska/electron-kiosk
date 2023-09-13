import { BrowserWindow } from "electron";
import { sendSystemWindowMessage } from "../main-event";
import { C } from "../constants";
import { Logger } from "../logger/file-logger";

export interface SystemWindowParams {
  readonly height: number;
  readonly width: number;
  readonly splashScreenMessage: string;
  readonly indexPath: string;
  readonly openDevTools: boolean;
  readonly showFrame: boolean;
}

const TAG = "SYSTEM-WINDOW: ";

export const createSystemWindow = (params: SystemWindowParams) => {
  const { height, width, splashScreenMessage, indexPath } = params;
  const win = new BrowserWindow({
    height,
    width,
    resizable: false,
    frame: params.showFrame,
    fullscreenable: true,
    focusable: true,
    backgroundColor: "black",
    webPreferences: {
      sandbox: true,
      devTools: params.openDevTools,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
    },
    kiosk: true,
    fullscreen: true,
  });
  win.webContents.on("did-finish-load", () => {
    Logger.info(TAG + "Did finish load");
  });
  win.closable = false;
  win.webContents.on("did-fail-load", (_event, _webContents) => {
    Logger.error(TAG + " Did fail load");
  });
  win.webContents.on("unresponsive", () => {
    Logger.error(TAG + "Unresponsive");
  });
  win.webContents.on("dom-ready", () => {
    Logger.error(TAG + "DOM READY");
  });
  win.on("show", () => {
    setTimeout(() => {
      win.setKiosk(true);
      win.setFullScreen(true);
    }, C.FOCUS_DELAY_SYSTEM_WINDOW);
  });
  win
    .loadFile(indexPath)
    .then(() => {
      Logger.info(TAG + "Loaded browser window - " + indexPath);
      sendSystemWindowMessage({ message: splashScreenMessage }, win);
    })
    .catch((e) => {
      console.log(e);
      Logger.error(TAG + "Error loading browser window - " + indexPath);
    });

  // const a = win.load
  const show = () => {
    win.show();
    win.focus();
  };
  const openDevTools = () => {
    Logger.info(TAG + "Opening dev tools");
    console.log("Opening dev tools");
    win.webContents.openDevTools();
  };
  return { win, show, openDevTools };
};
