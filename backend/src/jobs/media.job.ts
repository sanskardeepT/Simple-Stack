import { logger } from "../lib/logger.js";
import { mediaRepository } from "../modules/media/media.repository.js";

export async function processMediaJob(data: { mediaId?: string; storageKey?: string }): Promise<void> {
  logger.info("Media job received", data);
  if (data.mediaId) {
    await mediaRepository.updateStatus(data.mediaId, "ready");
  }
}
