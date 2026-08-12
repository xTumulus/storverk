import { z } from "zod";

export const educationEntrySchema = z.object({
  school: z.string(),
  degree: z.string(),
  year: z.string(),
  photo: z.string().optional(),
});
export const educationSchema = z.array(educationEntrySchema);

export type EducationEntry = z.infer<typeof educationEntrySchema>;
