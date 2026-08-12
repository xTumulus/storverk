# media.example/

Placeholder images/video/resume, committed to git so a fresh clone has
something to build against. `scripts/init-content.ts` copies these into
`media/` (never tracked in git — see the root `.gitignore`) the first time
you run `npm install`.

Once seeded, edit the files under `media/` directly — they're
runtime-managed and referenced from content files as absolute paths (e.g.
`/media/hobbies/example-hobby.svg`):

- In development (`npm run dev`) and `vite preview`, a small Vite plugin
  (`vite-media-plugin.ts`) serves `media/` at `/media`.
- In production, `docker-compose.yml` mounts `media/` as a volume over
  `/usr/share/nginx/html/media` in the container, so you can add/replace
  images and videos without rebuilding the Docker image.

Subdirectories (`education/`, `projects/`, `hobbies/`) are just a
convention for keeping things organized — matching content files by path is
up to you.
