import { z } from "zod";

export const mediaSchema = z.object({
  _id: z.string().optional(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
});

export type MediaInput = z.infer<typeof mediaSchema>;
