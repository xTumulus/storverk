import type { Plugin, ViteDevServer, PreviewServer } from "vite";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";

const MEDIA_DIR = resolve(import.meta.dirname, "media");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function serveMedia(server: ViteDevServer | PreviewServer) {
  server.middlewares.use((req, res, next) => {
    const urlPath = decodeURIComponent((req.url ?? "").split("?")[0]);
    if (!urlPath.startsWith("/media/")) return next();

    const filePath = resolve(MEDIA_DIR, `.${urlPath.slice("/media".length)}`);
    const isInsideMediaDir =
      filePath === MEDIA_DIR || filePath.startsWith(MEDIA_DIR + sep);
    if (
      !isInsideMediaDir ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      return next();
    }

    res.setHeader(
      "Content-Type",
      MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    );
    createReadStream(filePath).pipe(res);
  });
}

/**
 * Serves the top-level media/ directory at /media during `vite dev` and
 * `vite preview`, mirroring how nginx serves the Docker volume mount in
 * production (see docker-compose.yml). media/ is deliberately NOT inside
 * public/ — it's a runtime-managed asset store, not part of the built site,
 * so it must not get copied into dist/.
 */
export function mediaPlugin(): Plugin {
  return {
    name: "serve-media-directory",
    configureServer: serveMedia,
    configurePreviewServer: serveMedia,
  };
}
