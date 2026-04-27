import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const contentTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    fields: [
      {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        type: {
          type: String,
          required: true,
          enum: ["text", "richText", "number", "boolean", "image", "date", "select"],
        },
        required: { type: Boolean, default: false },
        defaultValue: { type: Schema.Types.Mixed },
        options: { type: Schema.Types.Mixed },
      },
    ],
    projectRef: { type: Types.ObjectId, ref: "Project", default: null },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    strict: true,
  },
);

contentTypeSchema.index({ slug: 1, createdBy: 1 }, { unique: true });
contentTypeSchema.index({ projectRef: 1, slug: 1 });
contentTypeSchema.index({ createdBy: 1 });
contentTypeSchema.index({ name: "text" });

export type ContentTypeDocument = InferSchemaType<typeof contentTypeSchema>;
export const ContentTypeModel =
  mongoose.models.ContentType || mongoose.model<ContentTypeDocument>("ContentType", contentTypeSchema);
