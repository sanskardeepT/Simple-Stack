import { RefreshTokenModel } from "../models/RefreshToken.js";
import { logger } from "../lib/logger.js";

export async function processCleanupJob(): Promise<void> {
  const result = await RefreshTokenModel.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { revoked: true }],
  });
  logger.info("Refresh token cleanup complete", { deleted: result.deletedCount });
}
