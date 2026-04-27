import { z } from "zod";

export const updateWebhookSchema = z.object({
  body: z.object({
    webhookUrl: z.string().url().or(z.literal("")),
  }),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}),
});
