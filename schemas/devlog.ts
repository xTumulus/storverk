import { z } from "zod";

export const devlogFrontmatterSchema = z.object({
  title: z.string(),
  images: z.array(z.string()).default([]),
  video: z.string().url().optional(),
});

export type DevlogFrontmatter = z.infer<typeof devlogFrontmatterSchema>;

/** Generated (non-authored) shape produced by build-content.ts. */
export interface DevlogEntry extends DevlogFrontmatter {
  date: string;
  bodyHtml: string;
  excerpt: string;
  videoId: string | null; // parsed from `video`
}
