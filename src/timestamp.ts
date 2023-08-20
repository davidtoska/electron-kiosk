import { z } from "zod";

export const timestamp = z
  .number()
  .positive("A timestamp must be positive")
  .brand("TIMESTAMP");

export type Timestamp = z.infer<typeof timestamp>;

export namespace Timestamp {
  export type Diff = number & { __type__: "diff_ms" };

  export const now = (): Timestamp => Date.now() as Timestamp;

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
