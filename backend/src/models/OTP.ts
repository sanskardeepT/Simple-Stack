import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const otpSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true, select: false },
    type: { type: String, enum: ["email", "sms"], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: true,
  },
);

otpSchema.index({ userId: 1, type: 1, used: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OTPDocument = InferSchemaType<typeof otpSchema>;
export const OTPModel = mongoose.models.OTP || mongoose.model<OTPDocument>("OTP", otpSchema);
