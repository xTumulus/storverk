import { z } from "zod";
import type { DevlogEntry } from "./devlog.ts";

// Everything you built lives here: a hand-written project, a GitHub repo
// (auto-fetched via `repo`), a demo video (`videoUrl`), and/or an
// in-progress build with a thumbnail/progress bar and dated devlogs — all
// optional facets of the same entry, not separate content types.
export const projectFrontmatterSchema = z
  .object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),
    url: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    repo: z.object({ owner: z.string(), repo: z.string() }).optional(),
    thumbnail: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    videoUrl: z.string().url().optional(),
  })
  .refine((data) => !(data.repo && data.repoUrl), {
    message:
      "Set either `repo` (auto-fetch from GitHub) or `repoUrl` (a plain link), not both.",
    path: ["repo"],
  });

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

/** Generated (non-authored) shape produced by build-content.ts. */
export interface Project extends ProjectFrontmatter {
  slug: string;
  bodyHtml: string; // hand-written body, or the fetched README when `repo` is set
  videoId: string | null; // parsed from videoUrl
  stars: number | null; // populated only when `repo` is set
  latestDevlog: DevlogEntry | null;
}
