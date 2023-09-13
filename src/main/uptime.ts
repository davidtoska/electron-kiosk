import { Timestamp } from "../timestamp";

const t0 = Timestamp.now();
const ms = (): Uptime => Timestamp.diffNow(t0) as Uptime;

const sec = (): UptimeSec => (ms() / 1000) as UptimeSec;
const secStr = () => sec() + " s.";
const msStr = () => ms() + " ms.";
export type Uptime = Timestamp.Diff & { __type__: "uptime" };
export type UptimeSec = Timestamp.Diff & { __type__: "uptime_in_Seconds" };

export const Uptime = Object.freeze({
  t0,
  ms,
  sec,
  secStr,
  msStr,
});
