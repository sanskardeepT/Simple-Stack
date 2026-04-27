import { api } from "./client.js";

export type SubscriptionStatus = {
  status: "inactive" | "active" | "expired" | "cancelled";
  plan: "none" | "paid" | "coupon" | "free_trial";
  expiry: string | null;
  coupon: string;
  monthlyPrice: number;
  graceDays: number;
};

export function subscriptionStatusApi() {
  return api.get("/subscriptions/status");
}

export function applyCouponApi(code: string) {
  return api.post("/subscriptions/coupon", { code });
}

export function createCheckoutApi() {
  return api.post("/subscriptions/checkout", {});
}

export function verifyPaymentApi(payload: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}) {
  return api.post("/subscriptions/verify-payment", payload);
}
