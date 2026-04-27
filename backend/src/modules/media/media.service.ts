import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "../../config/env.js";
import { mediaQueue } from "../../jobs/queue.js";
import { ApiError } from "../../lib/errors.js";
import { projectsRepository } from "../projects/projects.repository.js";
import { mediaRepository } from "./media.repository.js";

const uploadRoot = path.resolve(process.cwd(), "uploads");
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const cloudinaryEnabled = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function ownerScope(user: { userId: string; role: "superadmin" | "user" }) {
  return user.role === "superadmin" ? {} : { uploadedBy: user.userId };
}

async function uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<{ url: string; storageKey: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `simplestack/${folder || "root"}`,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          publicId: result.public_id,
        });
      },
    );
    stream.end(file.buffer);
  });
}

async function storeFile(file: Express.Multer.File, folder: string): Promise<{ url: string; storageKey: string; publicId: string }> {
  const safeFolder = folder || "root";
  if (cloudinaryEnabled) {
    return uploadToCloudinary(file, safeFolder);
  }

  const storageKey = `${safeFolder}/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
  const absolutePath = path.join(uploadRoot, storageKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);
  return {
    storageKey,
    publicId: "",
    url: `/uploads/${storageKey.replace(/\\/g, "/")}`,
  };
}

export const mediaService = {
  list(query: Record<string, unknown>, user: { userId: string; role: "superadmin" | "user" }) {
    return mediaRepository.findAll(query, ownerScope(user));
  },
  getOne(id: string, user: { userId: string; role: "superadmin" | "user" }) {
    return mediaRepository.findById(id, ownerScope(user));
  },
  async create(file: Express.Multer.File | undefined, dto: { folder?: string; alt?: string }, userId: string) {
    if (!file) {
      throw new ApiError(400, "FILE_REQUIRED", "A file upload is required");
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "INVALID_FILE_TYPE", "Only JPG, PNG, WebP, and GIF images are allowed");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError(400, "FILE_TOO_LARGE", "File size must be 10MB or less");
    }

    const stored = await storeFile(file, dto.folder ?? "root");
    const project = await projectsRepository.findOneByUser(userId) ?? await projectsRepository.createDefault(userId);
    const created = await mediaRepository.create({
      filename: path.basename(stored.storageKey),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: stored.url,
      storageKey: stored.storageKey,
      publicId: stored.publicId,
      uploadedBy: userId,
      projectRef: project._id,
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
  async remove(id: string, user: { userId: string; role: "superadmin" | "user" }) {
    const deleted = await mediaRepository.delete(id, ownerScope(user));
    if (!deleted) {
      throw new ApiError(404, "NOT_FOUND", "Media not found");
    }
    const storageKey = "storageKey" in deleted ? String(deleted.storageKey) : "";
    const publicId = "publicId" in deleted ? String(deleted.publicId ?? "") : "";
    if (cloudinaryEnabled && publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    } else if (storageKey) {
      await fs.unlink(path.join(uploadRoot, storageKey)).catch(() => {});
    }
    return deleted;
  },
};
