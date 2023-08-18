import { EVENTS_FROM_MAIN_CHANNEL, MainEvent } from "./main-event";
import { onOnlineStatusChange } from "./onOnlineStatusChange";
import { Config } from "./types";
let iframe: HTMLIFrameElement | null = null;
let config: Config | null = null;
let initialOnlineStable = false;
// let isOnline = false;
const TICK_RATE = 1000;

onOnlineStatusChange((onlineEvent) => {
  console.log(status);
  switch (onlineEvent.kind) {
    case "initial-online":
      initialOnlineStable = true;
      break;
    case "wentOffline":
      break;
    case "wentOnline":
      break;
  }
});

const initIframe = (config: Config) => {
  iframe = document.createElement("iframe");
  const { baseUrl, username, password } = config;
  const loadUrl = baseUrl + "?" + "uid=" + username + "&secret=" + password;
  iframe.src = loadUrl;
  iframe.classList.add("fullscreen", "iframe");
  document.body.appendChild(iframe);
};
const initInterval = window.setInterval(() => {
  if (iframe) return;
  if (!config) return;
  if (!initialOnlineStable) return;
  initIframe(config);
  window.clearInterval(initInterval);
}, TICK_RATE);

const mainEventHandler = (event: MainEvent) => {
  switch (event.kind) {
    case "init":
      config = event;
      break;
    case "next":
      if (iframe) {
        // TODO FORWARD TICK??
      }
      break;
    case "back":
      break;
    case "tick":
      break;
  }
};
window.addEventListener(EVENTS_FROM_MAIN_CHANNEL, (ev) => {
  if (ev instanceof CustomEvent) {
    const data = ev.detail;
    const parsed = MainEvent.safeParse(data);
    if (parsed.success) {
      mainEventHandler(parsed.data);
    } else {
      console.error("UNKNOWN EVENT SENT IN EVENTS_FROM_MAIN_CHANNEL", data);
      console.error(parsed.error);
    }
  } else {
    console.log("SHOULD BE CUSTOM EVENT");
  }
});
