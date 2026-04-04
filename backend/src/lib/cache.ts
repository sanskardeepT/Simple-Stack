import { redis } from "../config/redis.js";
import { logger } from "./logger.js";

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logger.warn("Cache get failed", {
      key,
      message: error instanceof Error ? error.message : "Unknown cache get error",
    });
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Cache set failed", {
      key,
      message: error instanceof Error ? error.message : "Unknown cache set error",
    });
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    logger.warn("Cache delete failed", {
      key,
      message: error instanceof Error ? error.message : "Unknown cache delete error",
    });
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    logger.warn("Cache pattern invalidation failed", {
      message: error instanceof Error ? error.message : "Unknown cache invalidation error",
      pattern,
    });
  }
}
