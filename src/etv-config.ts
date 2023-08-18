import { readFileSync, writeFileSync } from "fs";
import { Config } from "./types";

export const createConfigDb = (path: string) => {
  const write = (data: Config) => {
    const json = JSON.stringify(data, null, 4);
    writeFileSync(path, json, {});
  };
  const readOrThrow = (): Config => {
    const data = readFileSync(path).toString();
    const parsed = JSON.parse(data);
    const result = Config.parse(parsed);
    return result;
  };
  return {
    write,
    readOrThrow,
  };
};
