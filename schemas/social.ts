import { z } from "zod";

export const socialEntrySchema = z.object({
  platform: z.string(),
  label: z.string(),
  url: z.string().url(),
});
export const socialSchema = z.array(socialEntrySchema);

export type SocialEntry = z.infer<typeof socialEntrySchema>;
