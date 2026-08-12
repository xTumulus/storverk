import { z } from "zod";

export const volunteerEntrySchema = z.object({
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  summary: z.string(),
});
export const volunteerSchema = z.array(volunteerEntrySchema);

export type VolunteerEntry = z.infer<typeof volunteerEntrySchema>;
