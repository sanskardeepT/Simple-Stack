import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const mediaSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true, maxlength: 200 },
    originalName: { type: String, required: true, trim: true, maxlength: 200 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    size: { type: Number, required: true, min: 0 },
    url: { type: String, required: true, trim: true },
    storageKey: { type: String, required: true, trim: true },
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
    folder: { type: String, trim: true, default: "root", maxlength: 120 },
    alt: { type: String, trim: true, default: "", maxlength: 180 },
    status: { type: String, enum: ["uploaded", "processing", "ready", "failed"], default: "uploaded" },
  },
  {
    timestamps: true,
    strict: true,
  },
);

mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ mimeType: 1 });

export type MediaDocument = InferSchemaType<typeof mediaSchema>;
export const MediaModel = mongoose.models.Media || mongoose.model<MediaDocument>("Media", mediaSchema);
