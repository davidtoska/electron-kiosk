import { Timestamp } from "../../timestamp";
import { Config } from "../../config";

interface LoadedState {
  readonly kind: "loaded";
  readonly url: string;
  readonly loadEnd: Timestamp;
  readonly loadTime: Timestamp.Diff;
  lastAck: Timestamp | false;
}

interface PreloadState {
  readonly kind: "preload";
}

interface LoadingState {
  readonly kind: "loading";
  readonly url: string;
  readonly loadStart: Timestamp;
}
interface ErrorState {
  readonly kind: "error";
  readonly url: string;
  readonly error: string;
  readonly errorAt: Timestamp;
}

type State = PreloadState | LoadingState | LoadedState | ErrorState;

const preload = (): State => ({ kind: "preload" });

const loading = (url: string, loadStart: Timestamp): LoadingState => ({
  kind: "loading",
  url,
  loadStart,
});

const loaded = (url: string, loadStart: Timestamp) => {
  const loadEnd = Timestamp.now();
  const loadTime = Timestamp.diff(loadStart, loadEnd);
  const loaded: State = {
    kind: "loaded",
    url,
    loadEnd,
    loadTime,
    lastAck: false,
  } as State;
  return loaded;
};

// TODO add a test for this function.
const checkReloadRequired = (
  state: State,
  ack: Config["ack"],
): false | { url: string; reason: string } => {
  const lim = ack.timeoutAndReload;
  const mode = ack.required;
  if (mode === "never") return false;
  if (state.kind === "preload") return false;
  if (state.kind === "loading") {
    const loadingTimedOut = Timestamp.diffNow(state.loadStart) > lim;

    return loadingTimedOut
      ? {
          url: state.url,
          reason:
            "[ RELOAD_REASON ]: The browser-window has loaded for too long: ",
        }
      : false;
  }
  if (state.kind === "error") {
    const retryAfter = 5000;
    return Timestamp.diffNow(state.errorAt) > retryAfter
      ? {
          url: state.url,
          reason:
            "[ RELOAD_REASON ]: Try to reload after 5 seconds of error-state.",
        }
      : false;
  }
  const loadTimeout = Timestamp.diffNow(state.loadEnd) > lim;

  if (!loadTimeout) return false;

  // We now know that load-end is older than timeout.
  const ac = state.lastAck;
  if (!ac)
    return {
      url: state.url,
      reason:
        "[ RELOAD_REASON ]: The webContent has loaded, but no ack has been registered. ()",
    };
  const sinceLastAck = Timestamp.diffNow(ac);
  const ackTimedOut = sinceLastAck > lim;

  return mode === "always" && ackTimedOut
    ? {
        url: state.url,
        reason:
          " [ RELOAD_REASON ]: The last ack came " +
          sinceLastAck +
          " ms ago. Will reload, since ack is required always.",
      }
    : false;
};

const error = (url: string, error: string): State =>
  ({
    kind: "error",
    url,
    error,
    errorAt: Timestamp.now(),
  }) as State;

export const WS = {
  checkReloadRequired,
  preload,
  loaded,
  loading,
  error,
};
