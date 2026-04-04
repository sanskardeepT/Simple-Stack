import http from "node:http";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { redis } from "./config/redis.js";
import { closeQueues, startWorkers } from "./jobs/queue.js";
import { logger } from "./lib/logger.js";

let server: http.Server | null = null;

async function shutdown(signal: string): Promise<void> {
  logger.warn("Starting graceful shutdown", { signal });

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  await Promise.all([mongoose.disconnect(), redis.quit(), closeQueues()]);
}

async function bootstrap(): Promise<void> {
  await connectDB();
  await redis.ping();
  startWorkers();

  const app = createApp();
  server = app.listen(env.PORT, () => {
    logger.info("CMS API started", { port: env.PORT, nodeEnv: env.NODE_ENV });
  });
}

void bootstrap().catch(async (error: unknown) => {
  logger.error("Failed to start server", {
    message: error instanceof Error ? error.message : "Unknown bootstrap error",
    stack: error instanceof Error ? error.stack : undefined,
  });
  await shutdown("bootstrap-failure").catch(() => undefined);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal)
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        logger.error("Shutdown failed", {
          message: error instanceof Error ? error.message : "Unknown shutdown error",
        });
        process.exit(1);
      });
  });
}

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message, stack: error.stack });
  void shutdown("uncaughtException").finally(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", {
    message: reason instanceof Error ? reason.message : "Unknown rejection",
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  void shutdown("unhandledRejection").finally(() => process.exit(1));
});
