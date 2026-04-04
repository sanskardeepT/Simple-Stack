import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().min(2).default("15m"),
  JWT_REFRESH_EXPIRES: z.string().min(2).default("7d"),
  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AWS_S3_BUCKET: z.string().trim().optional().or(z.literal("")),
  AWS_ACCESS_KEY_ID: z.string().trim().optional().or(z.literal("")),
  AWS_SECRET_ACCESS_KEY: z.string().trim().optional().or(z.literal("")),
  AWS_REGION: z.string().trim().optional().or(z.literal("")),
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
