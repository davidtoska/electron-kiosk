import { SYSTEM_DATA_EVENT_NAME, SystemData } from "../main-event";
import { onlineStatusChanged } from "./isOnline";

const onLineStatus = document.getElementById("online-status");
const messageEl = document.getElementById("message");

const renderOnlineStatus = (isOnline: boolean) => {
  if (onLineStatus) {
    onLineStatus.innerText = isOnline ? "" : "OFFLINE";
  } else {
    console.log("NO ONLINE STATUS ELEMENT");
  }
};

onlineStatusChanged(renderOnlineStatus);
const renderMessage = (message: string) => {
  if (messageEl) {
    messageEl.innerText = message;
  } else {
    console.log("NO MESSAGE ELEMENT");
  }
};
console.log(messageEl);
// TODO IF SYSTEM NEED EVENT FROM MAIN.
window.addEventListener(SYSTEM_DATA_EVENT_NAME, (ev) => {
  console.log(ev);
  if (ev instanceof CustomEvent) {
    const parsed = SystemData.safeParse(ev.detail);
    if (parsed.success) {
      renderMessage(parsed.data.message);
    } else {
      console.log("COULD NOT PARSE SYSTEM DATA");
    }
  } else {
    console.log("SHOULD BE CUSTOM EVENT");
  }
});
