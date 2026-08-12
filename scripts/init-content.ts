import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// content/ and media/ are gitignored (see .gitignore) so real personal data
// never gets committed. This seeds them from the tracked *.example/
// counterparts on first run, copying file-by-file and never touching a
// destination file that already exists — safe to rerun after pulling new
// example files without clobbering anything you've already edited.

const ROOT = resolve(import.meta.dirname, "..");
const PAIRS = [
  ["content.example", "content"],
  ["media.example", "media"],
] as const;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory()
      ? listFiles(fullPath)
      : [fullPath];
  });
}

function seed(exampleDirName: string, realDirName: string): number {
  const exampleDir = join(ROOT, exampleDirName);
  if (!existsSync(exampleDir)) return 0;

  let copied = 0;
  for (const src of listFiles(exampleDir)) {
    const dest = join(ROOT, realDirName, relative(exampleDir, src));
    if (existsSync(dest)) continue;
    mkdirSync(join(dest, ".."), { recursive: true });
    copyFileSync(src, dest);
    copied++;
  }
  return copied;
}

function main() {
  for (const [exampleDirName, realDirName] of PAIRS) {
    const copied = seed(exampleDirName, realDirName);
    if (copied > 0) {
      console.log(
        `[init-content] seeded ${copied} file(s) into ${realDirName}/ from ${exampleDirName}/`,
      );
    }
  }
}

main();
