import { Types } from "mongoose";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { UserModel } from "../../models/User.js";

type LeanUser = {
  _id: unknown;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  isActive: boolean;
};

export const authRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email }).select("+passwordHash").exec();
  },
  findById(id: string) {
    return UserModel.findById(id).lean<LeanUser>().exec();
  },
  createUser(dto: { name: string; email: string; passwordHash: string; role?: "admin" | "editor" | "viewer" }) {
    return UserModel.create({
      ...dto,
      role: dto.role ?? "viewer",
    });
  },
  updateLastLogin(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { $set: { lastLoginAt: new Date() } }, { new: true }).lean().exec();
  },
  saveRefreshToken(input: { token: string; userId: string; family: string; role: string; expiresAt: Date }) {
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
