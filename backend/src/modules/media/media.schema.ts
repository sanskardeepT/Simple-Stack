import { z } from "zod";

export const mediaListSchema = z.object({
  body: z.object({}),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    folder: z.string().optional(),
    mimeType: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const mediaIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});

export const mediaCreateSchema = z.object({
  body: z.object({
    folder: z.string().optional(),
    alt: z.string().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});
