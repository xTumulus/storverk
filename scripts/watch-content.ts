import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

// Runs inside the Docker runtime image only (see docker/entrypoint.sh).
// Watches the live-mounted content/ and src/styles/ volumes and reruns
// scripts/rebuild-site.ts on change, debounced so editors that write via
// temp-file-and-rename (or a bulk `git pull`/`rsync` touching many files at
// once) trigger one rebuild instead of several overlapping ones.

const ROOT = resolve(import.meta.dirname, "..");
const WATCHED_DIRS = [resolve(ROOT, "content"), resolve(ROOT, "src/styles")];
const DEBOUNCE_MS = 500;

let debounceTimer: NodeJS.Timeout | null = null;
let rebuildInFlight = false;
let rebuildQueued = false;

function scheduleRebuild() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRebuild, DEBOUNCE_MS);
}

function runRebuild() {
  if (rebuildInFlight) {
    rebuildQueued = true;
    return;
  }
  rebuildInFlight = true;
  console.log("[watch-content] change detected — rebuilding");

  const child = spawn("node", ["scripts/rebuild-site.ts"], {
    cwd: ROOT,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    rebuildInFlight = false;
    if (code !== 0) {
      console.error(
        `[watch-content] rebuild failed (exit ${code}) — previous build is still live`,
      );
    }
    if (rebuildQueued) {
      rebuildQueued = false;
      scheduleRebuild();
    }
  });
}

for (const dir of WATCHED_DIRS) {
  watch(dir, { recursive: true }, () => scheduleRebuild());
}

console.log(`[watch-content] watching ${WATCHED_DIRS.join(", ")} for changes`);
