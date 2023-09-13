import { z } from "zod";
import { readFileSync } from "fs";

const primitiveRecord = z.record(
  z.union([z.string(), z.number(), z.boolean()]),
);

const shortCutAction = z.union([
  z.literal("reload"),
  z.literal("quit"),
  z.literal("customEvent"),
]);
export type ShortCutAction = z.infer<typeof shortCutAction>;
const ConfigParser = z.object({
  baseUrl: z.string(),
  splashScreenMessage: z.string(),
  userGestureTickHz: z.number().min(10),
  ack: z.object({
    ackString: z.string().nonempty(),
    required: z.union([
      z.literal("once"),
      z.literal("always"),
      z.literal("never"),
    ]),
    timeoutAndReload: z.number().min(1000),
  }),
  shortCuts: z.array(
    z.object({
      key: z.string().nonempty(),
      message: z.string(),
      action: shortCutAction,
    }),
  ),
  webContentData: z.object({
    deliver: z.union([z.literal("at-least-once"), z.literal("always")]),
    hz: z.number().min(10),
    data: primitiveRecord,
    openDevTools: z.boolean().default(false),
    showFrame: z.boolean().default(false),
  }),
});

export interface Config {
  baseUrl: string;
  splashScreenMessage: string;
  userGestureTickHz: number;
  ack: {
    ackString: string;
    required: "once" | "always" | "never";
    timeoutAndReload: number;
  };
  shortCuts: Array<{
    key: string;
    message: string;
    action: "reload" | "quit" | "customEvent";
  }>;
  webContentData: {
    deliver: "at-least-once" | "always";
    hz: number;
    data: Record<string, string | number | boolean>;
    openDevTools: boolean;
    showFrame: boolean;
  };
}

export const parseOrThrow = (path: string): Config => {
  const data = readFileSync(path).toString();
  const jsonParsed = JSON.parse(data);
  const parsed = ConfigParser.parse(jsonParsed);
  const {
    baseUrl,
    ack,
    shortCuts,
    splashScreenMessage,
    userGestureTickHz,
    webContentData,
  } = parsed;

  // The following is a workaround for not using the zod inference (better intellisense).
  // const a: Config["shortCuts"] = [...shortCuts]
  const _config: Config = {
    baseUrl,
    shortCuts,
    userGestureTickHz,
    ack,
    splashScreenMessage,
    webContentData,
  };
  return _config;
};

export const Config = {
  parseOrThrow,
};

// export type Config = z.infer<typeof Config>;
