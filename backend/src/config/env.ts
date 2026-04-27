import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().min(2).default("15m"),
  JWT_REFRESH_EXPIRES: z.string().min(2).default("7d"),
  RESEND_API_KEY: z.string().trim().default(""),
  MSG91_API_KEY: z.string().trim().default(""),
  MSG91_SENDER_ID: z.string().trim().default(""),
  SUPERADMIN_EMAIL: z.string().email(),
  COUPON_CODE: z.string().trim().default("SANSKARDEEP"),
  RAZORPAY_KEY_ID: z.string().trim().default(""),
  RAZORPAY_KEY_SECRET: z.string().trim().default(""),
  RAZORPAY_PLAN_ID: z.string().trim().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().trim().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().trim().default(""),
  CLOUDINARY_API_KEY: z.string().trim().default(""),
  CLOUDINARY_API_SECRET: z.string().trim().default(""),
  ALLOWED_ORIGINS: z.string().min(1).default("http://localhost:5173"),
  AWS_S3_BUCKET: z.string().trim().default(""),
  AWS_ACCESS_KEY_ID: z.string().trim().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().trim().default(""),
  AWS_REGION: z.string().trim().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  process.stderr.write("Environment validation failed:\n");
  parsedEnv.error.issues.forEach((issue) => {
    process.stderr.write(`- ${issue.path.join(".") || "env"}: ${issue.message}\n`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
