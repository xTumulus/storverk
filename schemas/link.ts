import { z } from "zod";

export const linkEntrySchema = z.object({
  label: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  icon: z.string().default("link"),
});
export const linksSchema = z.array(linkEntrySchema);

export type LinkEntry = z.infer<typeof linkEntrySchema>;
