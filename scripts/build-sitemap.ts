import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { siteConfig } from "../src/generated/site-config.ts";

// Runs after `vite-ssg build` (see the `postbuild` npm script). Deriving the
// URL list by scanning dist/ for the .html files vite-ssg actually produced
// — rather than hand-maintaining a route list here too — means this can
// never drift out of sync with what got prerendered.

const ROOT = resolve(import.meta.dirname, "..");
// Overridable to match whatever release directory scripts/rebuild-site.ts
// just built (see vite.config.ts's SITE_OUT_DIR), instead of always ./dist.
const DIST_DIR = process.env.SITE_OUT_DIR
  ? resolve(process.env.SITE_OUT_DIR)
  : join(ROOT, "dist");

function findHtmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return findHtmlFiles(fullPath);
    return entry.endsWith(".html") ? [fullPath] : [];
  });
}

function toRoutePath(htmlFile: string): string {
  const rel = relative(DIST_DIR, htmlFile).replace(/\.html$/, "");
  return rel === "index" ? "/" : `/${rel}`;
}

function main() {
  if (!existsSync(DIST_DIR)) {
    throw new Error("dist/ not found — run this after `vite-ssg build`.");
  }

  const routes = findHtmlFiles(DIST_DIR)
    .map(toRoutePath)
    .filter((route) => route !== "/404")
    .sort();

  const urls = routes
    .map((route) => `  <url><loc>${siteConfig.site.domain}${route}</loc></url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(join(DIST_DIR, "sitemap.xml"), sitemap);

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.site.domain}/sitemap.xml\n`;
  writeFileSync(join(DIST_DIR, "robots.txt"), robots);

  console.log(
    `Wrote sitemap.xml (${routes.length} URLs) and robots.txt to ${DIST_DIR}`,
  );
}

main();
