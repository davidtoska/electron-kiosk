import { app, globalShortcut } from "electron";
import {} from "./main-event";
import * as path from "path";

import { Uptime } from "./main/uptime";
import { FILE_TAG, Logger } from "./logger/file-logger";

import { createSystemWindow, SystemWindowParams } from "./main/system-window";
import { createWebWindow, WebWindowParams } from "./main/web/web-window";
import { Config } from "./config";
const MAIN: FILE_TAG = " MAIN: ";

Logger.log(MAIN + "Starting...");

const APP_PATH = app.getAppPath();
const CONFIG_PATH = path.join(APP_PATH, "iframe.config.json");
const INDEX_PATH = path.join(APP_PATH, "index.html");
const WEB_WINDOW_LOAD_DELAY = 1000;

const config = Config.parseOrThrow(CONFIG_PATH);
Logger.log(MAIN + "CONFIG: " + JSON.stringify(config));

const TICK_INTERVAL = config.userGestureTickHz;

const shortcuts = config.shortCuts;

const beforeQuit = new Set<() => void>();
const quit = () => {
  beforeQuit.forEach((f) => f());
  app.quit();
};
// const cleanup =

const program = async () => {
  try {
    await app.whenReady();
    Logger.log(MAIN + "APP READY IN: " + Uptime.msStr());
  } catch (e) {
    console.log(e);
    Logger.error(MAIN + "APP READY ERROR: " + e);
  }
  const { screen } = require("electron");
  const display = screen.getPrimaryDisplay();
  const { height, width } = display.bounds;
  const systemWindowParams: SystemWindowParams = {
    height,
    width,
    splashScreenMessage: config.splashScreenMessage,
    indexPath: INDEX_PATH,
  };

  const system = createSystemWindow(systemWindowParams);
  const webWindowParams: WebWindowParams = {
    height,
    width,
    ack: config.ack,
    webContentData: config.webContentData,
    parent: system.win,
    openDevTools: config.webContentData.openDevTools,
    showFrame: config.webContentData.showFrame,
  };
  const webWindow = createWebWindow(webWindowParams);
  setTimeout(() => {
    webWindow.show();
    setTimeout(() => {
      webWindow.loadUrl(config.baseUrl);
    }, 10);
  }, WEB_WINDOW_LOAD_DELAY);

  if (config.webContentData.openDevTools) {
    system.openDevTools();
    Logger.log(MAIN + "OPENED DEVTOOLS FOR SYSTEM WINDOW");
  }

  /**
   * Register shortcuts:
   * e.g.: { key: "CommandOrControl+q", message: "escape", action: "quit" },
   */
  shortcuts.forEach((shortcut) => {
    const { message, key, action } = shortcut;
    globalShortcut.register(key, () => {
      if (action === "quit") {
        quit();
        return;
      }
      if (action === "reload") {
        webWindow.loadUrl(config.baseUrl);
      }

      if (action === "customEvent") {
        webWindow.sendMessage({ kind: "keyboard", message });
      }
    });

    Logger.log(MAIN + "Register shortcut ", shortcut);
  });

  const tickRef = setInterval(() => {
    webWindow.tick();
  }, TICK_INTERVAL);
  beforeQuit.add(() => clearInterval(tickRef));

  Logger.log(MAIN + "Started with tick interval: " + TICK_INTERVAL);
};

program()
  .then(() => {
    const loadTime = Uptime.msStr();
    Logger.info(MAIN + " program load: " + loadTime);
  })
  .catch((e) => {
    console.log(e);
  });

app.on("window-all-closed", () => {
  Logger.info("WINDOW ALL CLOSED");
  quit();
});
