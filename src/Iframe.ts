import { z } from "zod";
import { timestamp, Timestamp } from "./timestamp";

const ContentWindowOk = z.object({
  isOk: z.literal(true),
  timestamp,
});

const ContentWindowError = z.object({
  isOk: z.literal(false),
  timestamp,
  message: z.string(),
});

const ContentWindowMessage = z.union([ContentWindowOk, ContentWindowError]);

class IframeState {
  private readonly LOAD_TIMEOUT = 6000;
  private kind: "no-url" | "loading" | "loaded" = "no-url";
  private transitionAt = Timestamp.now();
  doReload() {
    if (this.kind !== "loading") return false;
    const loadingTime = Timestamp.diffNow(this.transitionAt);
    return loadingTime > this.LOAD_TIMEOUT;
  }
  setState(state: "loading" | "loaded") {
    this.kind = state;
    this.transitionAt = Timestamp.now();
  }
}

export class Iframe {
  private readonly TAG = "[ Iframe ]:";
  private readonly _onEventHandler: (ev: any) => void;
  private readonly el = document.createElement("iframe");
  private state = new IframeState();
  private lastMessage: { isOk: true; timestamp: Timestamp } | null = null;

  constructor(onEventHandler: (ev: any) => void) {
    this._onEventHandler = onEventHandler;
    this._onEventHandler("CONSTRUCTOR");
    this.el.loading = "auto";
    this.el.classList.add("fullscreen", "iframe");
    const initialLoadTicker = window.setInterval(() => {
      if (this.state.doReload()) {
        this.reloadUrl();
        console.log(this.TAG + "Loading timed out, will reload url");
      } else {
        // console.log("NO RELOAD");
      }
    }, 300);
    window.addEventListener("message", (ev) => {
      const parsed = ContentWindowMessage.safeParse(ev.data);
      if (parsed.success) {
        const message = parsed.data;
        if (message.isOk && this.lastMessage === null) {
          // THIS MEANS THAT THE CONTENT IS RECIEVED.
          this.lastMessage = message;
          this.state.setState("loaded");
          window.clearInterval(initialLoadTicker);
          console.groupCollapsed(this.TAG + " IFRAME WEB CONTENT LOADED.");
          console.log(message);
          console.log("clearInterval(initialLoadTicker)");
          console.groupEnd();
        }
      } else {
        console.log(parsed.error);
      }
    });

    this.el.onloadstart = (ev) => {
      this._onEventHandler(ev);
    };
    this.el.onloadstart = (ev) => {
      this._onEventHandler(ev);
    };

    this.el.onload = (ev) => {
      this._onEventHandler(ev);
    };
    this.el.onerror = (ev) => {
      this._onEventHandler(ev);
    };
  }

  sendMessage(message: string) {
    this.el.contentWindow?.postMessage(message, "*");
  }
  loadUrl(url: string): void {
    this.state.setState("loading");
    this.el.src = url;
  }

  private reloadUrl() {
    const url = this.el.src;
    console.groupCollapsed(this.TAG + " Iframe loading timeout. RELOADING!!");
    console.log(url);
    console.groupEnd();
    this.el.src = "";
    this.state.setState("loading");
    setTimeout(() => {
      this.el.src = url;
    }, 10);
  }

  getHtmlElement() {
    return this.el;
  }
}
