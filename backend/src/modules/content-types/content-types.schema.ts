import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["text", "richtext", "number", "boolean", "date", "media", "relation", "json"]),
  required: z.boolean().optional().default(false),
  defaultValue: z.unknown().optional(),
  options: z.unknown().optional(),
});

export const createContentTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(500).optional(),
    fields: z.array(fieldSchema).min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateContentTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),
    fields: z.array(fieldSchema).min(1).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}),
});

export const contentTypeListSchema = z.object({
  body: z.object({}),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const contentTypeIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}),
});
