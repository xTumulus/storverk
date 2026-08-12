import { z } from "zod";

export const hobbyEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().default("interests"),
  image: z.string().optional(),
});
export const hobbiesSchema = z.array(hobbyEntrySchema);

export type HobbyEntry = z.infer<typeof hobbyEntrySchema>;

/** Generated (non-authored) shape produced by build-content.ts. */
export interface Hobby extends HobbyEntry {
  bodyHtml: string | null;
}
