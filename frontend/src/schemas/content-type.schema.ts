import { z } from "zod";

export const contentTypeSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  fields: z.array(z.record(z.unknown())).optional(),
});

export type ContentTypeInput = z.infer<typeof contentTypeSchema>;
