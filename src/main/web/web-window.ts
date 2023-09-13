import { BrowserWindow } from "electron";
import { sendWebWindowMessage, WebContentMessage } from "../../main-event";
import { Config } from "../../config";
import { Timestamp } from "../../timestamp";
import { WS } from "./web-window-state";
import { Logger } from "../../logger/file-logger";
import { C } from "../../constants";

export type WebWindowParams = {
  height: number;
  width: number;
  ack: Config["ack"];
  webContentData: Config["webContentData"];
  openDevTools: boolean;
  showFrame: boolean;
  parent: BrowserWindow;
};

let state = WS.preload();

const TAG = "WEB-WINDOW: ";
export const createWebWindow = (params: WebWindowParams) => {
  state = WS.preload();
  const { height, width, ack, webContentData, parent, showFrame } = params;
  const win = new BrowserWindow({
    height,
    width,

    frame: showFrame,
    resizable: false,
    fullscreenable: true,
    focusable: true,
    backgroundColor: "gray",
    show: false,
    parent,
    webPreferences: {
      sandbox: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
    },
  });

  const show = () => {
    win.show();
    win.focus();
    win.moveTop();
  };

  win.on("unresponsive", () => {
    Logger.error(TAG + "unresponsive");
  });
  win.webContents.on("did-finish-load", () => {
    Logger.info(TAG + "Did finish load");
  });

  win.webContents.on("did-fail-load", (_ev, _web) => {
    Logger.error(TAG + "Did fail load");
  });

  win.webContents.on("dom-ready", () => {
    Logger.error(TAG + "DOM READY");
  });
  win.webContents.on("console-message", (_a, _b, message) => {
    if (message === ack.ackString) {
      if (state.kind === "loaded") {
        state.lastAck = Timestamp.now();
      } else {
        Logger.warn(
          TAG + "INVALID STATE: Ack received but not in loaded state",
        );
      }
    }
  });

  win.on("show", () => {
    Logger.info(TAG + "SHOW");
    setTimeout(() => {
      win.setKiosk(true);
      win.setFullScreen(true);
      win.moveTop();
    }, C.FOCUS_DELAY_SYSTEM_WINDOW);
  });

  const tryToSendTick = (): boolean => {
    const data = webContentData.data;
    if (state.kind === "loaded") {
      sendWebWindowMessage({ kind: "tick", data }, win);
      return true;
    }
    return false;
  };

  const loadUrl = (url: string) => {
    if (win.isDestroyed()) {
      // TODO RELOAD the window.
      //
      return;
    }

    const loadStart = Timestamp.now();

    state = WS.loading(url, loadStart);
    win
      .loadURL(url, {})
      .then(() => {
        state = WS.loaded(url, loadStart);
        Logger.info("LOADED: " + url);
      })
      .catch((e) => {
        console.log(e);
        console.log(e);
        console.log(e);
        console.log(e);
        const m =
          typeof e.message === "string"
            ? e.message
            : "unknown-reason why url could not be loaded " + url;
        state = WS.error(url, m);
        Logger.error("Could not load url: " + url + " error-message: " + m);
      });
  };

  const hide = () => {
    win.hide();
  };

  /**
   * Send tick to web window.
   * Check that web window is loaded.
   */
  const tick = () => {
    let reloadNeeded = WS.checkReloadRequired(state, ack);
    if (reloadNeeded) {
      loadUrl(reloadNeeded.url);
      Logger.warn("Reloading browser-window ", reloadNeeded);
    } else {
      tryToSendTick();
    }
  };

  const sendMessage = (message: WebContentMessage) => {
    if (state.kind === "loaded") {
      sendWebWindowMessage(message, win);
    }
  };
  return Object.freeze({ sendMessage, show, hide, tick, loadUrl });
};
