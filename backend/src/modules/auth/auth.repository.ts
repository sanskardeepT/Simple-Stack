import { Types } from "mongoose";
import { OTPModel } from "../../models/OTP.js";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { UserModel } from "../../models/User.js";

export type AuthRole = "superadmin" | "user";

export type LeanAuthUser = {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: AuthRole;
  isActive: boolean;
  lastLogin?: Date;
  subscription?: {
    status: "inactive" | "active" | "expired" | "cancelled";
    plan: "none" | "paid" | "coupon" | "free_trial";
    expiry?: Date | null;
    coupon?: string;
  } | null;
};

export const authRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email }).select("+passwordHash").exec();
  },
  findByPhone(phone: string) {
    return UserModel.findOne({ phone }).lean<LeanAuthUser>().exec();
  },
  findById(id: string) {
    return UserModel.findById(id).lean<LeanAuthUser>().exec();
  },
  createUser(dto: { name: string; email: string; phone: string; passwordHash: string; role: AuthRole }) {
    return UserModel.create(dto);
  },
  updateLastLogin(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { $set: { lastLogin: new Date() } }, { new: true }).lean().exec();
  },
  markVerified(userId: string, type: "email" | "sms") {
    const field = type === "email" ? "emailVerified" : "phoneVerified";
    return UserModel.findByIdAndUpdate(userId, { $set: { [field]: true } }, { new: true }).lean<LeanAuthUser>().exec();
  },
  saveOtp(input: { userId: string; type: "email" | "sms"; codeHash: string; expiresAt: Date }) {
    return OTPModel.create({
      ...input,
      userId: new Types.ObjectId(input.userId),
    });
  },
  revokeOpenOtps(userId: string, type: "email" | "sms") {
    return OTPModel.updateMany({ userId: new Types.ObjectId(userId), type, used: false }, { $set: { used: true } }).exec();
  },
  findLatestOtp(userId: string, type: "email" | "sms") {
    return OTPModel.findOne({ userId: new Types.ObjectId(userId), type, used: false })
      .sort({ createdAt: -1 })
      .select("+codeHash")
      .exec();
  },
  markOtpUsed(id: string) {
    return OTPModel.findByIdAndUpdate(id, { $set: { used: true } }).exec();
  },
  saveRefreshToken(input: { token: string; userId: string; family: string; role: AuthRole; expiresAt: Date }) {
    return RefreshTokenModel.create({
      ...input,
      userId: new Types.ObjectId(input.userId),
    });
  },
  findRefreshToken(token: string) {
    return RefreshTokenModel.findOne({ token }).exec();
  },
  revokeToken(token: string) {
    return RefreshTokenModel.updateOne({ token }, { $set: { revoked: true } }).exec();
  },
  revokeFamilyTokens(family: string) {
    return RefreshTokenModel.updateMany({ family }, { $set: { revoked: true } }).exec();
  },
  revokeUserTokens(userId: string) {
    return RefreshTokenModel.updateMany({ userId: new Types.ObjectId(userId) }, { $set: { revoked: true } }).exec();
  },
};
