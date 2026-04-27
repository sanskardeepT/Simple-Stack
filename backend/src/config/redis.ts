import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
  lazyConnect: true,
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error: Error) => {
  logger.error("Redis error", { message: error.message });
});

redis.on("reconnecting", () => {
  logger.warn("Redis reconnecting");
});
