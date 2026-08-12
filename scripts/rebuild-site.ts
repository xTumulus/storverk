import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { join, resolve } from "node:path";

// Runs inside the Docker runtime image only (see docker/entrypoint.sh and
// scripts/watch-content.ts) — rebuilds the prerendered site from whatever's
// currently in the live-mounted content/ and src/styles/ volumes, then
// atomically repoints the nginx webroot at the new output. On any failure,
// the previous release keeps serving untouched: a bad content edit should
// never take the live site down, just fail to publish until it's fixed.
//
// vue-tsc typechecking is deliberately skipped here (unlike `npm run
// build`) — it checks the app's code, not content, and content is already
// validated against schemas/*.ts by build-content.ts below. Running it
// on every content edit would only add latency, not safety.

const ROOT = resolve(import.meta.dirname, "..");
const RELEASES_DIR = join(ROOT, "releases");
const LIVE_LINK = "/usr/share/nginx/html";
const SECURITY_HEADERS_OUT = "/etc/nginx/security-headers.conf";

const isInitial = process.argv.includes("--initial");

function run(command: string, args: string[], env: Record<string, string> = {}): boolean {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  return result.status === 0;
}

function readLiveTarget(): string | null {
  try {
    return readlinkSync(LIVE_LINK);
  } catch {
    return null;
  }
}

function main() {
  mkdirSync(RELEASES_DIR, { recursive: true });
  const releaseDir = join(RELEASES_DIR, `${Date.now()}`);
  mkdirSync(releaseDir, { recursive: true });

  const ok =
    run("node", ["scripts/build-content.ts"]) &&
    run("node", ["scripts/build-nginx-config.ts"], {
      NGINX_SECURITY_HEADERS_OUT: SECURITY_HEADERS_OUT,
    }) &&
    run("node_modules/.bin/vite-ssg", ["build"], { SITE_OUT_DIR: releaseDir }) &&
    run("node", ["scripts/build-sitemap.ts"], { SITE_OUT_DIR: releaseDir });

  if (!ok) {
    console.error(
      `[rebuild-site] build failed — leaving previous release live (${readLiveTarget() ?? "none yet"})`,
    );
    rmSync(releaseDir, { recursive: true, force: true });
    process.exitCode = 1;
    return;
  }

  const previousTarget = readLiveTarget();

  const tmpLink = `${LIVE_LINK}.tmp`;
  rmSync(tmpLink, { force: true });
  symlinkSync(releaseDir, tmpLink);
  renameSync(tmpLink, LIVE_LINK); // same directory/filesystem -> atomic

  // On the very first run (docker/entrypoint.sh, before nginx has started)
  // there's nothing listening to reload yet — nginx picks up
  // security-headers.conf fresh when it starts right afterward.
  if (!isInitial) {
    run("nginx", ["-s", "reload"]);
  }

  if (previousTarget && previousTarget !== releaseDir && existsSync(previousTarget)) {
    rmSync(previousTarget, { recursive: true, force: true });
  }

  console.log(`[rebuild-site] live: ${releaseDir}`);
}

main();
