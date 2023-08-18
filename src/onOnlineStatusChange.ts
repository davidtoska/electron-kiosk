export const isOnline = () => window.navigator.onLine;
let onlineCount = 0;
let tickCount = 0;
const ONLINE_TICK_RATE = 300;
const ONLINE_SETTELED_TRESHOLD = 5;

type OnlineEvent =
  | { kind: "initial-online"; isOnline: true }
  | { kind: "wentOffline"; isOnline: false }
  | { kind: "wentOnline"; isOnline: true };

let _callback = (event: OnlineEvent) => {
  console.log("NOBODY IS LISTENING FOR ONLINE CHANGE: STATUS", event);
};

window.addEventListener("offline", (e) => {
  console.log("offline");
  console.log(e);
  _callback({ kind: "wentOffline", isOnline: false });
});

window.addEventListener("online", (e) => {
  console.log("online");
  console.log(e);
  _callback({ kind: "wentOnline", isOnline: true });
});

export const onOnlineStatusChange = (
  onchange: (onlineEvent: OnlineEvent) => void,
) => {
  _callback = onchange;
  // const value = isOnline();
  // _onlineChangeCallback(value);
};

// const checkOnlineStatus = ()
const ref = window.setInterval(() => {
  tickCount = tickCount + 1;
  if (isOnline()) {
    onlineCount += 1;
    if (onlineCount === ONLINE_SETTELED_TRESHOLD) {
      _callback({ kind: "initial-online", isOnline: true });
      window.clearInterval(ref);
      console.log("[window.clearInterval(initialOnlineTicker)]");
    }
  } else {
    onlineCount = 0;
  }
}, ONLINE_TICK_RATE);
