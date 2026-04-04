import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true, trim: true, unique: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    family: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], required: true },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  },
);

refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshTokenModel =
  mongoose.models.RefreshToken || mongoose.model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);
