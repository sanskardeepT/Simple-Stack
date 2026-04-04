import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ApiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      status: "error",
      code: "INVALID_ID",
      message: `Invalid ${error.path}`,
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "number" &&
    (error as { code: number }).code === 11000
  ) {
    res.status(409).json({
      status: "error",
      code: "CONFLICT",
      message: "Duplicate value violates a unique constraint",
    });
    return;
  }

  const normalized = error instanceof Error ? error : new Error("Unknown server error");
  logger.error("Unhandled error", {
    message: normalized.message,
    requestId: req.requestId,
    stack: normalized.stack,
  });

  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: env.NODE_ENV === "production" ? "Internal server error" : normalized.message,
  });
}
