import { z } from "zod";

export const languageEntrySchema = z.object({
  name: z.string(),
  proficiency: z.string(),
});
export const languagesSchema = z.array(languageEntrySchema);

export type LanguageEntry = z.infer<typeof languageEntrySchema>;
