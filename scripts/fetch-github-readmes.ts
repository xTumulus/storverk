import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import sanitizeHtml from "sanitize-html";
import { projectFrontmatterSchema } from "../schemas/project.ts";
import { mdUntrusted } from "./markdown.ts";

// Build-time-only script: fetches repo metadata + README for every project
// under content/projects/*.md whose frontmatter sets `repo: {owner, repo}`,
// and writes the result to a git-ignored cache file. Run manually
// (`npm run fetch:github`) or in CI — never invoked automatically as part
// of `npm run build`, so the site build stays hermetic and unaffected by
// GitHub being unreachable.

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const CACHE_FILE = join(CONTENT_DIR, ".cache/github-readmes.json");

interface CacheEntry {
  description: string;
  htmlUrl: string;
  stars: number;
  readmeHtml: string;
}

async function fetchRepo(owner: string, repo: string): Promise<CacheEntry> {
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!repoRes.ok) {
    throw new Error(
      `GitHub API error for ${owner}/${repo}: ${repoRes.status} ${repoRes.statusText}`,
    );
  }
  const repoData = (await repoRes.json()) as {
    description: string | null;
    html_url: string;
    stargazers_count: number;
  };

  const readmeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: { Accept: "application/vnd.github.raw+json" },
    },
  );
  const readmeMarkdown = readmeRes.ok ? await readmeRes.text() : "";
  const readmeHtml = sanitizeHtml(mdUntrusted.render(readmeMarkdown), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "name", "target", "rel"],
    },
  });

  return {
    description: repoData.description ?? "",
    htmlUrl: repoData.html_url ?? `https://github.com/${owner}/${repo}`,
    stars: repoData.stargazers_count ?? 0,
    readmeHtml,
  };
}

/** Every `repo: {owner, repo}` declared across content/projects/*.md frontmatter. */
function findRepos(): { owner: string; repo: string }[] {
  const dir = join(CONTENT_DIR, "projects");
  const files = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".md"))
    : [];

  return files
    .map((file) => {
      const { data } = matter(readFileSync(join(dir, file), "utf-8"));
      const result = projectFrontmatterSchema.safeParse(data);
      if (!result.success) {
        throw new Error(
          `Invalid frontmatter in projects/${file}:\n${result.error.issues
            .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
            .join("\n")}`,
        );
      }
      return result.data.repo;
    })
    .filter((repo): repo is { owner: string; repo: string } => repo != null);
}

async function main() {
  const repos = findRepos();

  const cache: Record<string, CacheEntry> = existsSync(CACHE_FILE)
    ? JSON.parse(readFileSync(CACHE_FILE, "utf-8"))
    : {};

  for (const { owner, repo } of repos) {
    const key = `${owner}/${repo}`;
    console.log(`Fetching ${key}...`);
    try {
      cache[key] = await fetchRepo(owner, repo);
    } catch (error) {
      console.error(`Failed to fetch ${key}:`, (error as Error).message);
    }
  }

  mkdirSync(join(CONTENT_DIR, ".cache"), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`Wrote ${Object.keys(cache).length} repo(s) to ${CACHE_FILE}`);
}

main();
