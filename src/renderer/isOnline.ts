let _currentOnlineStatus = window.navigator.onLine;
let _cb = (_isOnline: boolean) => {};
let _diffCount = 0;
const HZ = 500;
const DIFF_TRESHOLD = 5;
setInterval(() => {
  const isOnlineNow = window.navigator.onLine;
  if (isOnlineNow !== _currentOnlineStatus) {
    _diffCount += 1;
    if (_diffCount >= DIFF_TRESHOLD) {
      _diffCount = 0;
      _currentOnlineStatus = isOnlineNow;
      _cb(_currentOnlineStatus);
    }
  }
}, HZ);
export const isOnline = () => _currentOnlineStatus;
export const onlineStatusChanged = (cb: (isOnline: boolean) => void) => {
  _cb = cb;
  _cb(_currentOnlineStatus);
};
