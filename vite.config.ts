import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import type { ViteSSGOptions } from "vite-ssg";
import { includedRoutes } from "./src/ssg-routes.ts";
import { mediaPlugin } from "./vite-media-plugin.ts";

const ssgOptions: ViteSSGOptions = {
  includedRoutes(paths: string[]) {
    return includedRoutes(paths);
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), mediaPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Overridable so scripts/rebuild-site.ts can build each live content
    // update into a fresh, isolated release directory (see docker/) instead
    // of always writing to ./dist.
    outDir: process.env.SITE_OUT_DIR ?? "dist",
    emptyOutDir: true,
  },
  ssgOptions,
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
