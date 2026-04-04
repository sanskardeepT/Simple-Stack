import { z } from "zod";

export const entrySchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  contentTypeId: z.string().optional(),
  fields: z.record(z.unknown()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
});

export type EntryInput = z.infer<typeof entrySchema>;
