import { z } from "zod";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const phonePattern = /^\+?[1-9]\d{9,14}$/;
const otpPattern = /^\d{6}$/;

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().transform((value) => value.toLowerCase()),
    phone: z.string().regex(phonePattern, "Enter a valid mobile number with country code"),
    password: z.string().min(8).regex(passwordPattern, {
      message: "Password must include uppercase, lowercase, number, and special character",
    }),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    type: z.enum(["email", "sms"]),
    code: z.string().regex(otpPattern, "OTP must be 6 digits"),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.toLowerCase()),
    type: z.enum(["email", "sms"]),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[a-z]/, "Password must include lowercase")
      .regex(/[^A-Za-z\d]/, "Password must include a special character"),
  }),
  params: z.object({}),
  query: z.object({}),
});
