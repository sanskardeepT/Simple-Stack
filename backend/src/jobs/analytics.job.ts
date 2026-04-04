import { logger } from "../lib/logger.js";
import { AnalyticsModel } from "../models/Analytics.js";

let processedCount = 0;

export async function processAnalyticsJob(data: Record<string, unknown>): Promise<void> {
  try {
    await AnalyticsModel.create(data);
    processedCount += 1;
    if (processedCount % 100 === 0) {
      logger.info("Processed analytics events batch", { processedCount });
    }
  } catch (error) {
    logger.error("Analytics job failed", {
      message: error instanceof Error ? error.message : "Unknown analytics job error",
    });
  }
}
