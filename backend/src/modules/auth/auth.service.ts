import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { env } from "../../config/env.js";
import { ApiError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { AnalyticsModel } from "../../models/Analytics.js";
import { UserModel, type UserHydratedDocument } from "../../models/User.js";
import { signAccessToken, signRefreshToken } from "../../services/token.service.js";
import { authRepository, type AuthRole, type LeanAuthUser } from "./auth.repository.js";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: AuthRole;
  subscription?: LeanAuthUser["subscription"];
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
    phone: user.phone,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    role: user.role,
    subscription: user.subscription ?? { status: "inactive", plan: "none", expiry: null, coupon: "" },
  };
}

function toAuthUser(user: LeanAuthUser): AuthUser {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    role: user.role,
    subscription: user.subscription,
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

function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function sendEmailOtp(email: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info("Email OTP generated", { email, code });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SimpleStack <onboarding@resend.dev>",
      to: email,
      subject: "Your SimpleStack verification code",
      html: `<p>Your SimpleStack email verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    throw new ApiError(502, "OTP_DELIVERY_FAILED", "Email OTP could not be sent");
  }
}

async function sendSmsOtp(phone: string, code: string): Promise<void> {
  if (!env.MSG91_API_KEY) {
    logger.info("SMS OTP generated", { phone, code });
    return;
  }

  const response = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      authkey: env.MSG91_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mobile: phone.replace(/^\+/, ""),
      otp: code,
      sender: env.MSG91_SENDER_ID || undefined,
    }),
  });

  if (!response.ok) {
    throw new ApiError(502, "OTP_DELIVERY_FAILED", "Mobile OTP could not be sent");
  }
}

async function createAndSendOtp(user: AuthUser, type: "email" | "sms"): Promise<void> {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  await authRepository.revokeOpenOtps(user._id, type);
  await authRepository.saveOtp({
    userId: user._id,
    type,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  if (type === "email") {
    await sendEmailOtp(user.email, code);
    return;
  }

  await sendSmsOtp(user.phone, code);
}

function ensureVerified(user: AuthUser): void {
  if (!user.emailVerified || !user.phoneVerified) {
    throw new ApiError(403, "ACCOUNT_NOT_VERIFIED", "Please verify both email and mobile OTP before signing in");
  }
}

export const authService = {
  setRefreshCookie: applyRefreshCookie,
  clearRefreshCookie(res: Response): void {
    res.clearCookie("refreshToken", refreshCookieOptions);
  },
  async register(dto: { name: string; email: string; phone: string; password: string }): Promise<{ user: ReturnType<typeof serializeUser>; nextStep: string }> {
    const existingEmail = await authRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ApiError(409, "EMAIL_TAKEN", "Email is already registered");
    }

    const existingPhone = await authRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ApiError(409, "PHONE_TAKEN", "Mobile number is already registered");
    }

    const role: AuthRole = dto.email === env.SUPERADMIN_EMAIL.toLowerCase() ? "superadmin" : "user";
    const created = await authRepository.createUser({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash: dto.password,
      role,
    });

    const safeUser = serializeUser({
      _id: String(created._id),
      name: created.name,
      email: created.email,
      phone: created.phone,
      emailVerified: created.emailVerified,
      phoneVerified: created.phoneVerified,
      role: created.role,
      subscription: created.subscription,
    });

    await Promise.all([createAndSendOtp(safeUser, "email"), createAndSendOtp(safeUser, "sms")]);
    return { user: safeUser, nextStep: "verify_email_and_mobile" };
  },
  async verifyOtp(dto: { email: string; type: "email" | "sms"; code: string }): Promise<{ user: ReturnType<typeof serializeUser>; accessToken?: string; refreshToken?: string }> {
    const user = (await authRepository.findByEmail(dto.email)) as UserHydratedDocument | null;
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "Account not found");
    }

    const otp = await authRepository.findLatestOtp(String(user._id), dto.type);
    if (!otp || otp.used || otp.expiresAt.getTime() <= Date.now()) {
      throw new ApiError(400, "OTP_EXPIRED", "OTP is invalid or expired");
    }

    const matches = await bcrypt.compare(dto.code, otp.codeHash);
    if (!matches) {
      throw new ApiError(400, "OTP_INVALID", "OTP is invalid or expired");
    }

    await authRepository.markOtpUsed(String(otp._id));
    const updated = await authRepository.markVerified(String(user._id), dto.type);
    if (!updated) {
      throw new ApiError(404, "USER_NOT_FOUND", "Account not found");
    }

    const authUser = toAuthUser(updated);
    const safeUser = serializeUser(authUser);
    if (!authUser.emailVerified || !authUser.phoneVerified) {
      return { user: safeUser };
    }

    const tokens = await issueTokenPair(authUser);
    return { user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },
  async resendOtp(dto: { email: string; type: "email" | "sms" }): Promise<{ sent: true }> {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "Account not found");
    }

    if ((dto.type === "email" && user.emailVerified) || (dto.type === "sms" && user.phoneVerified)) {
      throw new ApiError(400, "ALREADY_VERIFIED", "This verification is already complete");
    }

    await createAndSendOtp(
      {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
        subscription: user.subscription,
      },
      dto.type,
    );
    return { sent: true };
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

    const authUser: AuthUser = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      role: user.role,
      subscription: user.subscription,
    };
    ensureVerified(authUser);

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

    const tokens = await issueTokenPair(authUser);
    return { user: serializeUser(authUser), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
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

    const authUser = toAuthUser(user);
    ensureVerified(authUser);
    await authRepository.revokeToken(cookieToken);
    const tokens = await issueTokenPair(authUser, existing.family);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: serializeUser(authUser) };
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

    return serializeUser(toAuthUser(user));
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
