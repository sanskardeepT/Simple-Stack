import { api } from "./client.js";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; phone: string; password: string };
export type VerifyOtpPayload = { email: string; type: "email" | "sms"; code: string };
export type ResendOtpPayload = { email: string; type: "email" | "sms" };

export function loginApi(payload: LoginPayload) {
  return api.post("/auth/login", payload);
}

export function registerApi(payload: RegisterPayload) {
  return api.post("/auth/register", payload);
}

export function verifyOtpApi(payload: VerifyOtpPayload) {
  return api.post("/auth/verify-otp", payload);
}

export function resendOtpApi(payload: ResendOtpPayload) {
  return api.post("/auth/resend-otp", payload);
}

export function meApi() {
  return api.get("/auth/me");
}

export function logoutApi() {
  return api.post("/auth/logout");
}

export function changePasswordApi(payload: { currentPassword: string; newPassword: string }) {
  return api.patch("/auth/change-password", payload);
}
