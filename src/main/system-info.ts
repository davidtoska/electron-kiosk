export const getSystemInfo = () => {
  const { screen } = require("electron");
  const display = screen.getPrimaryDisplay();
  const { height, width } = display.bounds;
  const allDisplays = screen.getAllDisplays();
  const displays = allDisplays.map((display) => {
    const { height, width } = display.bounds;
    return { height, width };
  });

  const os = require("os");
  const osInfo = os.userInfo();
  const arch = os.arch();
  const platform = os.platform();
  const release = os.release();
  const type = os.type();
  const version = os.version();
  const hostname = os.hostname();
  const homedir = os.homedir();
  return {
    height,
    width,
    displays,
    osInfo,
    arch,
    platform,
    release,
    type,
    version,
    hostname,
    homedir,
  };
};
