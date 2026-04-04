import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("Request completed", {
      duration: Date.now() - startedAt,
      ip: req.ip,
      method: req.method,
      requestId: req.requestId,
      status: res.statusCode,
      url: req.originalUrl,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}
