import { projects } from "./generated/projects.ts";

// Deliberately separate from router.ts: router.ts's route table uses dynamic
// `import('./pages/...')` for each page, and vite.config.ts needs this
// function at config-load time. If vite.config.ts imported router.ts
// directly, TypeScript's checker would follow those dynamic imports into
// the entire page/component tree while type-checking vite.config.ts under
// tsconfig.node.json's Node-only (no DOM/vite-client types) settings. This
// file only touches generated data, never components, so that can't happen.

/** Every concrete route vite-ssg should prerender, including dynamic slugs. */
export function includedRoutes(paths: string[]): string[] {
  const staticPaths = paths.filter(
    (path) => !path.includes(":") && !path.includes("*"),
  );
  const projectPaths = projects.map((project) => `/projects/${project.slug}`);
  return [...staticPaths, ...projectPaths];
}
