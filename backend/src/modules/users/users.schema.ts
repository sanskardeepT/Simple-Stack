import { z } from "zod";

export const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    status: z.enum(["inactive", "active", "expired", "cancelled"]).optional(),
    plan: z.enum(["none", "paid", "coupon", "free_trial"]).optional(),
  }),
});

export const userIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().transform((value) => value.toLowerCase()).optional(),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

export const subscriptionActionSchema = z.object({
  body: z.object({
    months: z.coerce.number().int().min(1).max(24).optional(),
    plan: z.enum(["paid", "coupon", "free_trial"]).optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

export const exportUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["inactive", "active", "expired", "cancelled"]).optional(),
    plan: z.enum(["none", "paid", "coupon", "free_trial"]).optional(),
  }),
});
