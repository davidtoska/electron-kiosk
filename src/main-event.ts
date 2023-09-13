import { BrowserWindow } from "electron";
import { z } from "zod";

export type WebContentMessage =
  | { kind: "tick"; data: Record<string, string | boolean | number> }
  | { kind: "keyboard"; message: string };

export const SYSTEM_DATA_EVENT_NAME = "systemData";

export const SystemData = z.object({ message: z.string() });
export type SystemData = z.infer<typeof SystemData>;

export const WEB_CONTENT_EVENT_NAME = "kioskRuntime";

const sendCustomEvent = (
  event: Record<string, any>,
  window: BrowserWindow,
  eventName: string,
): boolean => {
  if (window.isDestroyed()) {
    return false;
  }

  const asJson = JSON.stringify(event);
  const code = `
    (function () {
        const customEvent = new CustomEvent("${eventName}", { detail: ${asJson}});
        window.dispatchEvent(customEvent);
     })();`;
  window.webContents
    .executeJavaScript(code, true)
    .then(() => {
      // console.log("SENT");
    })
    .catch((e: unknown) => {
      console.log(e);
    });

  return true;
};

export const sendSystemWindowMessage = (
  event: SystemData,
  window: BrowserWindow,
) => {
  sendCustomEvent(event, window, SYSTEM_DATA_EVENT_NAME);
};

export const sendWebWindowMessage = (
  message: WebContentMessage,
  window: BrowserWindow,
) => {
  sendCustomEvent(message, window, WEB_CONTENT_EVENT_NAME);
};
