import { z } from "zod";

export const experienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
});
export const experienceSchema = z.array(experienceEntrySchema);

export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
