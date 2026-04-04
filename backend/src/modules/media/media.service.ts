import fs from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";
import { mediaQueue } from "../../jobs/queue.js";
import { ApiError } from "../../lib/errors.js";
import { mediaRepository } from "./media.repository.js";

const uploadRoot = path.resolve(process.cwd(), "uploads");
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const s3Client =
  env.AWS_S3_BUCKET && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION
    ? new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

async function storeFile(file: Express.Multer.File, folder: string): Promise<{ url: string; storageKey: string }> {
  const safeFolder = folder || "root";
  const storageKey = `${safeFolder}/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

  if (s3Client && env.AWS_S3_BUCKET) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: storageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return {
      storageKey,
      url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${storageKey}`,
    };
  }

  const absolutePath = path.join(uploadRoot, storageKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);
  return {
    storageKey,
    url: `/uploads/${storageKey.replace(/\\/g, "/")}`,
  };
}

export const mediaService = {
  list(query: Record<string, unknown>) {
    return mediaRepository.findAll(query);
  },
  getOne(id: string) {
    return mediaRepository.findById(id);
  },
  async create(file: Express.Multer.File | undefined, dto: { folder?: string; alt?: string }, userId: string) {
    if (!file) {
      throw new ApiError(400, "FILE_REQUIRED", "A file upload is required");
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "INVALID_FILE_TYPE", "Only images and document uploads are allowed");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError(400, "FILE_TOO_LARGE", "File size must be 10MB or less");
    }

    const stored = await storeFile(file, dto.folder ?? "root");
    const created = await mediaRepository.create({
      filename: path.basename(stored.storageKey),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: stored.url,
      storageKey: stored.storageKey,
      uploadedBy: userId,
      folder: dto.folder ?? "root",
      alt: dto.alt ?? "",
      status: "uploaded",
    });

    await mediaQueue.add("process-media", {
      mediaId: String(created._id),
      storageKey: stored.storageKey,
    });

    return created.toObject();
  },
  async remove(id: string) {
    const deleted = await mediaRepository.delete(id);
    if (!deleted) {
      throw new ApiError(404, "NOT_FOUND", "Media not found");
    }
    return deleted;
  },
};
