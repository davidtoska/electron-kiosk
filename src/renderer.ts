import { EVENTS_FROM_MAIN_CHANNEL, MainEvent } from "./main-event";
import { onOnlineStatusChange } from "./onOnlineStatusChange";
import { Config } from "./types";
import { Iframe } from "./Iframe";
let config: Config | null = null;
let initialOnlineStable = false;
const TICK_RATE = 1000;

const iframe = new Iframe((ev) => {
  console.log(ev);
});

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

const initInterval = window.setInterval(() => {
  if (!config) return;
  if (!initialOnlineStable) return;
  const { baseUrl, username, password } = config;
  const loadUrl = baseUrl + "?" + "uid=" + username + "&secret=" + password;
  // const testIframe = "TestIframe.html"
  iframe.loadUrl(loadUrl);
  document.body.appendChild(iframe.getHtmlElement());

  // initIframe(config);
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
