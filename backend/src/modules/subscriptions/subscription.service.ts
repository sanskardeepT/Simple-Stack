import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../../config/env.js";
import { ApiError } from "../../lib/errors.js";
import { sendEmail } from "../../services/email.service.js";
import { subscriptionRepository } from "./subscription.repository.js";

const MONTHLY_PRICE_IN_PAISE = 100 * 100;
const GRACE_DAYS = 3;

function serializeSubscription(subscription?: {
  status?: string;
  plan?: string;
  expiry?: Date | string | null;
  coupon?: string;
} | null) {
  return {
    status: subscription?.status ?? "inactive",
    plan: subscription?.plan ?? "none",
    expiry: subscription?.expiry ?? null,
    coupon: subscription?.coupon ?? "",
    monthlyPrice: 100,
    graceDays: GRACE_DAYS,
  };
}

function getRazorpayClient() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export const subscriptionService = {
  async status(userId: string) {
    const user = await subscriptionRepository.findUser(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    return serializeSubscription(user.subscription);
  },
  async applyCoupon(userId: string, code: string) {
    if (code.trim().toUpperCase() !== env.COUPON_CODE.toUpperCase()) {
      throw new ApiError(400, "COUPON_INVALID", "This coupon code is not valid");
    }

    const updated = await subscriptionRepository.activateCoupon(userId, env.COUPON_CODE);
    if (!updated) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    await sendEmail({
      to: String(updated.email),
      subject: "Your SimpleStack plan is now active",
      html: `<p>Your coupon <strong>${env.COUPON_CODE}</strong> was applied successfully.</p><p>Your SimpleStack plan is now active and free.</p>`,
    });

    return {
      subscription: serializeSubscription({
        status: "active",
        plan: "coupon",
        expiry: null,
        coupon: env.COUPON_CODE,
      }),
      message: "This plan is now free for you.",
    };
  },
  async createCheckout(userId: string) {
    const user = await subscriptionRepository.findUser(userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    const razorpay = getRazorpayClient();
    if (!razorpay || !env.RAZORPAY_PLAN_ID) {
      if (env.NODE_ENV === "production") {
        throw new ApiError(500, "PAYMENT_NOT_CONFIGURED", "Payment gateway is not configured");
      }

      return {
        keyId: env.RAZORPAY_KEY_ID,
        subscriptionId: `dev_sub_${Date.now()}`,
        amount: MONTHLY_PRICE_IN_PAISE,
        currency: "INR",
        isMock: true,
      };
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 120,
      notes: {
        userId,
        email: user.email,
      },
    });

    return {
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      amount: MONTHLY_PRICE_IN_PAISE,
      currency: "INR",
      isMock: false,
    };
  },
  async verifyPayment(userId: string, dto: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) {
    if (!env.RAZORPAY_KEY_SECRET) {
      if (env.NODE_ENV !== "production" && dto.razorpay_signature === "dev_mock_signature") {
        const activated = await subscriptionRepository.activatePaid(userId);
        if (activated) {
          await sendEmail({
            to: String(activated.email),
            subject: "Your SimpleStack subscription is active",
            html: "<p>Your payment was confirmed and your SimpleStack subscription is now active.</p>",
          });
        }
        return { subscription: await this.status(userId) };
      }
      throw new ApiError(500, "PAYMENT_NOT_CONFIGURED", "Payment gateway is not configured");
    }

    const payload = `${dto.razorpay_payment_id}|${dto.razorpay_subscription_id}`;
    const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(payload).digest("hex");
    if (expected !== dto.razorpay_signature) {
      throw new ApiError(400, "PAYMENT_SIGNATURE_INVALID", "Payment verification failed");
    }

    const activated = await subscriptionRepository.activatePaid(userId);
    if (activated) {
      await sendEmail({
        to: String(activated.email),
        subject: "Your SimpleStack subscription is active",
        html: "<p>Your payment was confirmed and your SimpleStack subscription is now active.</p>",
      });
    }
    return { subscription: await this.status(userId) };
  },
  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new ApiError(500, "WEBHOOK_NOT_CONFIGURED", "Razorpay webhook secret is missing");
    }

    const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
    if (!signature || expected !== signature) {
      throw new ApiError(400, "WEBHOOK_SIGNATURE_INVALID", "Webhook signature is invalid");
    }

    const event = JSON.parse(rawBody.toString("utf8")) as {
      event?: string;
      payload?: {
        subscription?: { entity?: { notes?: { userId?: string } } };
      };
    };

    const userId = event.payload?.subscription?.entity?.notes?.userId;
    if (!userId) {
      return { received: true, ignored: true };
    }

    if (event.event === "subscription.charged" || event.event === "subscription.activated") {
      const activated = await subscriptionRepository.activatePaid(userId);
      if (activated) {
        await sendEmail({
          to: String(activated.email),
          subject: "SimpleStack renewal confirmed",
          html: "<p>Your SimpleStack subscription is active and your renewal was recorded successfully.</p>",
        });
      }
    }

    if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      await subscriptionRepository.deactivate(userId);
    }

    return { received: true };
  },
};
