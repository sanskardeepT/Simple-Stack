import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";
import { env } from "../config/env.js";

const logsDir = path.resolve(process.cwd(), "logs");

if (env.NODE_ENV === "production" && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaText = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level} ${stack ?? message}${metaText}`;
  }),
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

const loggerTransports: Array<transports.ConsoleTransportInstance | transports.FileTransportInstance> = [
  new transports.Console(),
];

if (env.NODE_ENV === "production") {
  loggerTransports.push(
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logsDir, "combined.log") }),
  );
}

export const logger = createLogger({
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  level: env.LOG_LEVEL,
  transports: loggerTransports,
});
