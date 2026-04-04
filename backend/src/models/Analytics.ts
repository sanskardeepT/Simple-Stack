import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const analyticsSchema = new Schema(
  {
    event: { type: String, enum: ["view", "click", "search", "login", "error"], required: true },
    entityType: { type: String, enum: ["entry", "media", "user", "system"], required: true },
    entityId: { type: Types.ObjectId },
    userId: { type: Types.ObjectId, ref: "User" },
    sessionId: { type: String, required: true, trim: true, maxlength: 120 },
    ip: { type: String, trim: true, maxlength: 80, default: "" },
    meta: { type: Map, of: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
  },
  {
    timestamps: false,
    strict: true,
  },
);

analyticsSchema.index({ event: 1, entityType: 1, createdAt: -1 });
analyticsSchema.index({ entityId: 1, event: 1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type AnalyticsDocument = InferSchemaType<typeof analyticsSchema>;
export const AnalyticsModel =
  mongoose.models.Analytics || mongoose.model<AnalyticsDocument>("Analytics", analyticsSchema);
