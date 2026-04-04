import cookieParser from "cookie-parser";
import express from "express";
import { ApiError } from "./lib/errors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { corsMiddleware, globalRateLimit, helmetMiddleware } from "./middleware/security.js";
import { v1Routes } from "./routes/v1.js";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(globalRateLimit);
  app.use("/api/v1", v1Routes);
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
  app.use((_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Route not found"));
  });
  app.use(errorHandler);

  return app;
}
