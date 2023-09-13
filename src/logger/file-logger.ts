import { ILogger } from "./ILogger";
import { app } from "electron";
import * as fs from "fs";
import { Timestamp } from "../timestamp";
import { Uptime } from "../main/uptime";

const path = require("path");

const appPath = app.getAppPath();

export type FILE_TAG = ` ${Uppercase<string>}: `;

const TAG: FILE_TAG = " FILE LOGGER: ";

const logPath = path.join(appPath, "logs");

if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
  console.log("CREATED LOGS FOLDER");
}
const logFilePath = path.join(logPath, "log.txt");

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
  console.log("CREATED LOG FILE");
}

export type LogData = Record<string, string | number | boolean>;

export const LogData = {
  is: (obj: unknown): obj is LogData => {
    if (typeof obj !== "object") {
      return false;
    }

    if (obj === null) {
      return false;
    }

    if (Array.isArray(obj)) {
      return false;
    }
    const entries = Object.entries(obj);
    let isValid = true;

    entries.forEach(([_, value]) => {
      const notString = typeof value !== "string";
      const notNumber = typeof value !== "number";
      const notBoolean = typeof value !== "boolean";
      if (notString && notNumber && notBoolean) {
        isValid = false;
      }
    });

    return isValid;
  },
};

export type LogEntry = {
  readonly level: "error" | "warn" | "info" | "log";
  readonly upTime: string;
  readonly date: string;
  readonly time: string;
  readonly message: string;
  readonly data: LogData;
};

const createLogEntry = (level: LogEntry["level"]) => {
  return (message: string, logData?: LogData): LogEntry => {
    const data = LogData.is(logData) ? logData : {};
    const upTime = Uptime.sec() + "s";
    const date = Timestamp.dateYYYYMMDD();
    const time = Timestamp.time24();
    return {
      date,
      time,
      level,
      upTime,
      message,
      data,
    };
  };
};
const createErrorLogEntry = createLogEntry("error");
const createWarnLogEntry = createLogEntry("warn");
const createInfoLogEntry = createLogEntry("info");
const createLogLogEntry = createLogEntry("log");

const minLengthStr = (str: string, minLength: number): string => {
  if (str.length < minLength) {
    return str.padEnd(minLength);
  }
  return str;
};
// Add padding to both sides of string
const padStr = (str: string, totalLen: number): string => {
  const diff = totalLen - str.length;
  if (diff <= 0) return str;
  const left = Math.floor(diff / 2);
  const right = Math.ceil(diff / 2);
  const leftPad = " ".repeat(left);
  const rightPad = " ".repeat(right);
  return leftPad + str + rightPad;
};

export class FileLogger implements ILogger {
  private readonly path: string;
  private readonly logStream: fs.WriteStream;

  constructor() {
    this.path = path.join(logPath, "log.txt");
    this.logStream = fs.createWriteStream(this.path, { flags: "a" });
  }

  error(message: string, data?: LogData): void {
    const entry = createErrorLogEntry(message, data);
    this.writeLogEntry(entry);
  }

  info(message: string, data?: LogData): void {
    const entry = createInfoLogEntry(message, data);
    this.writeLogEntry(entry);
  }

  log(message: string, data?: LogData): void {
    const entry = createLogLogEntry(message, data);
    this.writeLogEntry(entry);
  }

  warn(message: string, data?: LogData): void {
    const entry = createWarnLogEntry(message, data);
    this.writeLogEntry(entry);
  }

  private writeLogEntry(entry: LogEntry) {
    const { date, time, message } = entry;
    const up = padStr(entry.upTime, 16);
    const level = minLengthStr(entry.level, 5);
    const entries = Object.entries(entry.data);
    const line = [date, time, up, level, message];
    let lineStr = line.join("  |  ");
    if (entries.length > 0) {
      const json = JSON.stringify(entry.data, null);
      lineStr = lineStr.concat(`, ${json}`);
    }
    this.logStream.write(lineStr + "\n");
  }
}

export const Logger = new FileLogger();
Logger.log(TAG + "Logger created");
