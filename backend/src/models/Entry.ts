import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const entrySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    contentTypeId: { type: Types.ObjectId, ref: "ContentType", required: true },
    projectRef: { type: Types.ObjectId, ref: "Project", default: null },
    fields: { type: Map, of: Schema.Types.Mixed, default: {} },
    publishedAt: { type: Date },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    viewCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true,
    strict: true,
  },
);

entrySchema.index({ contentTypeId: 1, status: 1, createdAt: -1 });
entrySchema.index({ projectRef: 1, status: 1, updatedAt: -1 });
entrySchema.index({ slug: 1, contentTypeId: 1 }, { unique: true });
entrySchema.index({ title: "text", tags: "text" });
entrySchema.index({ tags: 1 });
entrySchema.index({ status: 1, publishedAt: -1 });
entrySchema.index({ viewCount: -1 });

export type EntryDocument = InferSchemaType<typeof entrySchema>;
export const EntryModel = mongoose.models.Entry || mongoose.model<EntryDocument>("Entry", entrySchema);
