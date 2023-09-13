import { z } from "zod";

export const timestamp = z
  .number()
  .positive("A timestamp must be positive")
  .brand("TIMESTAMP");

export type Timestamp = z.infer<typeof timestamp>;

export namespace Timestamp {
  export type Diff = number & { __type__: "diff_ms" };
  export type NowString = string & { __type__: "now_string" };

  export const now = (): Timestamp => Date.now() as Timestamp;

  export const nowStr = (): NowString => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const str = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return str as NowString;
  };
  export const time24 = () => {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const str = `${hours}:${minutes}:${seconds}`;
    return str as NowString;
  };

  export const dateYYYYMMDD = (separator = "-"): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const str = [year, month, day].join(separator);
    return str;
  };

  export const diff = (first: Timestamp, last: Timestamp): Diff => {
    const result = Math.abs(first - last) as Diff;
    return result;
  };

  export const diffNow = (timestamp: Timestamp): Diff => {
    return diff(timestamp, now());
  };

  export const parse = (datetime: string | null): Date | null => {
    if (typeof datetime !== "string") return null;
    const maybeNumber = Date.parse(datetime);
    if (isNaN(maybeNumber)) {
      return null;
    }

    if (maybeNumber < 0) {
      return null;
    }
    return new Date(maybeNumber);
  };
}
