import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info("Email skipped because RESEND_API_KEY is missing", { to: input.to, subject: input.subject });
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
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    logger.warn("Email send failed", { to: input.to, subject: input.subject, status: response.status });
  }
}
