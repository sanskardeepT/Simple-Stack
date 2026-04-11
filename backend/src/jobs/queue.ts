import { Queue, Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../lib/logger.js";
import { processAnalyticsJob } from "./analytics.job.js";
import { processCleanupJob } from "./cleanup.job.js";
import { processMediaJob } from "./media.job.js";

const connection = redis.duplicate();

export const analyticsQueue = new Queue("analytics", { connection });
export const mediaQueue = new Queue("media", { connection });
export const cleanupQueue = new Queue("cleanup", { connection });

let analyticsWorker: Worker | null = null;
let mediaWorker: Worker | null = null;
let cleanupWorker: Worker | null = null;

export async function startWorkers(): Promise<void> {
  analyticsWorker = new Worker("analytics", async (job) => processAnalyticsJob(job.data as Record<string, unknown>), {
    connection: connection.duplicate(),
  });
  mediaWorker = new Worker("media", async (job) => processMediaJob(job.data as { mediaId?: string; storageKey?: string }), {
    connection: connection.duplicate(),
  });

  analyticsWorker.on("failed", (job, error) => {
    logger.error("Analytics worker failed", { error: error.message, jobId: job?.id });
  });
  mediaWorker.on("failed", (job, error) => {
    logger.error("Media worker failed", { error: error.message, jobId: job?.id });
  });

  cleanupWorker = new Worker("cleanup", async () => processCleanupJob(), {
    connection: connection.duplicate(),
  });
  cleanupWorker.on("failed", (job, error) => {
    logger.error("Cleanup worker failed", { error: error.message, jobId: job?.id });
  });
  await cleanupQueue.add("token-cleanup", {}, {
    repeat: { every: 24 * 60 * 60 * 1000 },
    jobId: "token-cleanup-recurring",
  });
}

export async function closeQueues(): Promise<void> {
  await Promise.all([
    analyticsWorker?.close(),
    mediaWorker?.close(),
    cleanupWorker?.close(),
    analyticsQueue.close(),
    mediaQueue.close(),
    cleanupQueue.close(),
  ]);
}
