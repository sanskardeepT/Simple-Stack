import { z } from "zod";

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1).max(40),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_subscription_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const emptySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});
