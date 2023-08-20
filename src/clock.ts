import { Timestamp } from "./timestamp";

class ClockImpl {
  private readonly t0 = Timestamp.now();

  sinceT0Sec() {
    return this.sinceT0Milli() / 1000;
  }

  sinceT0SecAsString() {
    const sec = this.sinceT0Sec();
    return sec + " s.";
  }

  sinceT0Milli() {
    return Timestamp.diffNow(this.t0);
  }

  sinceT0MilliAsString() {
    return Timestamp.diffNow(this.t0) + " ms.";
  }
}

export const Clock = new ClockImpl();
