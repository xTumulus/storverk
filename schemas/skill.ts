import { z } from "zod";

export const skillSchema = z.object({
  name: z.string(),
  details: z.array(z.string()).min(1),
});
export const skillsSchema = z.array(skillSchema);

export type Skill = z.infer<typeof skillSchema>;
