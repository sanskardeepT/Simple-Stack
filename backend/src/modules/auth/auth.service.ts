import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { env } from "../../config/env.js";
import { ApiError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { AnalyticsModel } from "../../models/Analytics.js";
import { UserModel, type UserHydratedDocument } from "../../models/User.js";
import { signAccessToken, signRefreshToken } from "../../services/token.service.js";
import { authRepository } from "./auth.repository.js";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  isActive?: boolean;
};

const refreshCookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth/refresh",
  sameSite: "strict" as const,
  secure: env.NODE_ENV === "production",
};

function serializeUser(user: AuthUser) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function issueTokenPair(user: AuthUser, family = randomUUID()): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({
    userId: String(user._id),
    role: user.role,
    email: user.email,
  });
  const refreshToken = signRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authRepository.saveRefreshToken({
    token: refreshToken,
    userId: String(user._id),
    family,
    role: user.role,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

function applyRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}

export const authService = {
  setRefreshCookie: applyRefreshCookie,
  clearRefreshCookie(res: Response): void {
    res.clearCookie("refreshToken", refreshCookieOptions);
  },
  async register(dto: { name: string; email: string; password: string }): Promise<{ user: ReturnType<typeof serializeUser>; accessToken: string; refreshToken: string }> {
    const existing = await authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ApiError(409, "EMAIL_TAKEN", "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const created = await authRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    const user = serializeUser({
      _id: String(created._id),
      name: created.name,
      email: created.email,
      role: created.role,
    });
    const tokens = await issueTokenPair(user);
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },
  async login(email: string, password: string): Promise<{ user: ReturnType<typeof serializeUser>; accessToken: string; refreshToken: string }> {
    const user = (await authRepository.findByEmail(email)) as UserHydratedDocument | null;
    if (!user) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "ACCOUNT_DISABLED", "Your account is disabled");
    }

    await authRepository.updateLastLogin(String(user._id));
    void AnalyticsModel.create({
      event: "login",
      entityType: "user",
      entityId: user._id,
      userId: user._id,
      sessionId: randomUUID(),
      ip: "",
      meta: {},
    }).catch((error: unknown) => {
      logger.warn("Failed to track login analytics", {
        message: error instanceof Error ? error.message : "Unknown analytics error",
      });
    });

    const safeUser = serializeUser({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    const tokens = await issueTokenPair(safeUser);
    return { user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },
  async refresh(cookieToken: string): Promise<{ accessToken: string; refreshToken: string; user: ReturnType<typeof serializeUser> }> {
    const existing = await authRepository.findRefreshToken(cookieToken);
    if (!existing) {
      throw new ApiError(401, "UNAUTHORIZED", "Refresh token is invalid");
    }
    if (existing.revoked) {
      await authRepository.revokeFamilyTokens(existing.family);
      throw new ApiError(401, "TOKEN_REUSE_DETECTED", "Refresh token reuse detected");
    }
    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new ApiError(401, "UNAUTHORIZED", "Refresh token expired");
    }

    const user = await authRepository.findById(String(existing.userId));
    if (!user || !user.isActive) {
      throw new ApiError(401, "UNAUTHORIZED", "User account is not available");
    }

    await authRepository.revokeToken(cookieToken);
    const safeUser = serializeUser({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    const tokens = await issueTokenPair(safeUser, existing.family);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: safeUser };
  },
  async logout(cookieToken: string | undefined): Promise<void> {
    if (cookieToken) {
      await authRepository.revokeToken(cookieToken);
    }
  },
  async me(userId: string): Promise<ReturnType<typeof serializeUser>> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    return serializeUser({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  },
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: true }> {
    const user = await UserModel.findById(userId).select("+passwordHash").exec();
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Current password is incorrect");
    }

    user.passwordHash = newPassword;
    await user.save();
    await authRepository.revokeUserTokens(userId);
    return { success: true };
  },
};
