import { BrowserWindow } from "electron";

export const sendCustomEvent = (
  message: { kind: string },
  window: BrowserWindow,
) => {
  const asJson = JSON.stringify(message);
  const code = `
    (function () {
        const customEvent = new CustomEvent("eventFromMain", { detail: ${asJson}});
        window.dispatchEvent(customEvent);
     })();`;
  window.webContents
    .executeJavaScript(code, true)
    .then(() => {})
    .catch((e: unknown) => {
      console.log(e);
    });
};
