import { z } from "zod";

export const createEntrySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    contentTypeId: z.string().min(1),
    fields: z.record(z.unknown()),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    tags: z.array(z.string().min(1)).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateEntrySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    contentTypeId: z.string().min(1).optional(),
    fields: z.record(z.unknown()).optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    tags: z.array(z.string().min(1)).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}),
});

export const listEntrySchema = z.object({
  body: z.object({}),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    contentTypeId: z.string().optional(),
    search: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

export const entryIdSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).passthrough(),
});
