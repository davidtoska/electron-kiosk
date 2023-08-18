import { BrowserWindow } from "electron";
import { z } from "zod";

import { baseUrl, password, username } from "./types";

export const NextEvent = z.object({ kind: z.literal("next") });
export type NextEvent = z.infer<typeof NextEvent>;
export const BackEvent = z.object({ kind: z.literal("back") });
export type BackEvent = z.infer<typeof BackEvent>;
export const TickEvent = z.object({ kind: z.literal("tick") });
export const InitEvent = z.object({
  kind: z.literal("init"),
  username,
  password,
  baseUrl,
});

export type InitEvent = z.infer<typeof InitEvent>;
export const MainEvent = z.union([NextEvent, BackEvent, InitEvent, TickEvent]);

export type MainEvent = z.infer<typeof MainEvent>;
export const EVENTS_FROM_MAIN_CHANNEL = "eventFromMain";
export const sendCustomEvent = (event: MainEvent, window: BrowserWindow) => {
  const asJson = JSON.stringify(event);
  const code = `
    (function () {
        const customEvent = new CustomEvent("${EVENTS_FROM_MAIN_CHANNEL}", { detail: ${asJson}});
        window.dispatchEvent(customEvent);
     })();`;
  window.webContents
    .executeJavaScript(code, true)
    .then(() => {})
    .catch((e: unknown) => {
      console.log(e);
    });
};
