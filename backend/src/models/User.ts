import bcrypt from "bcryptjs";
import mongoose, { Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 180 },
    phone: { type: String, required: true, trim: true, unique: true, maxlength: 20 },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["superadmin", "user"], default: "user" },
    subscription: {
      status: { type: String, enum: ["inactive", "active", "expired", "cancelled"], default: "inactive" },
      plan: { type: String, enum: ["none", "paid", "coupon", "free_trial"], default: "none" },
      expiry: { type: Date, default: null },
      coupon: { type: String, trim: true, default: "" },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    avatar: { type: String, trim: true },
  },
  {
    timestamps: true,
    strict: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.comparePassword = async function comparePassword(plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash as string);
};

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("passwordHash")) {
    next();
    return;
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export type UserDocument = InferSchemaType<typeof userSchema>;
export type UserHydratedDocument = HydratedDocument<UserDocument> & {
  comparePassword: (plain: string) => Promise<boolean>;
};
export const UserModel = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
