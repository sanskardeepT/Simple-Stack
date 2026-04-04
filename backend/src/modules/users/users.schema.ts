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
  }),
});

export const userIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

export const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "editor", "viewer"]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});
