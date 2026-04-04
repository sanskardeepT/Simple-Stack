import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", { message: error.message, stack: error.stack });
});

function backoff(attempt: number): Promise<void> {
  const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function connectDB(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      logger.info("Connecting to MongoDB", { attempt, uri: env.MONGODB_URI });
      await mongoose.connect(env.MONGODB_URI);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown MongoDB error";
      logger.warn("MongoDB connection attempt failed", { attempt, message });

      if (attempt === MAX_RETRIES) {
        throw error instanceof Error ? error : new Error("MongoDB connection failed");
      }

      await backoff(attempt);
    }
  }
}
