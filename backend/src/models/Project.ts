import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const projectSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    projectId: { type: String, required: true, trim: true, unique: true },
    apiKey: { type: String, required: true, trim: true, unique: true, select: false },
    connectedAt: { type: Date, default: null },
    webhookUrl: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
    strict: true,
  },
);

projectSchema.index({ projectId: 1 }, { unique: true });
projectSchema.index({ apiKey: 1 }, { unique: true });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;
export const ProjectModel = mongoose.models.Project || mongoose.model<ProjectDocument>("Project", projectSchema);
