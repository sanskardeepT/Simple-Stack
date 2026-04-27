import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/errors.js";
import { UserModel } from "../models/User.js";

const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

function isSubscriptionUsable(subscription?: {
  status?: string;
  expiry?: Date | null;
} | null): boolean {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  if (!subscription.expiry) {
    return true;
  }

  return subscription.expiry.getTime() + GRACE_PERIOD_MS >= Date.now();
}

export async function checkSubscription(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication required");
    }

    if (req.user.role === "superadmin") {
      next();
      return;
    }

    const user = await UserModel.findById(req.user.userId).select("subscription").lean<{
      subscription?: { status?: string; expiry?: Date | null } | null;
    }>().exec();

    if (!user || !isSubscriptionUsable(user.subscription)) {
      throw new ApiError(402, "SUBSCRIPTION_EXPIRED", "Your plan is inactive. Please subscribe to keep using SimpleStack.");
    }

    next();
  } catch (error) {
    next(error);
  }
}
