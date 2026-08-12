# Portfolio Site

An open-source, self-hosted portfolio/resume site for technical job seekers
(software engineers, data scientists, business analysts, etc.). Fully static
— no backend, no auth, no cloud dependency — and content is edited directly
in the files under `content/`, not through any in-browser admin UI.

## Tech stack, and why

| Tool | Why it's here |
|---|---|
| **Vue 3 + Vite** | The UI framework and build tool, kept close to "vanilla" — no meta-framework (Nuxt was deliberately not used to avoid its bundled routing/rendering opinions). |
| **TypeScript** | Pairs with the content pipeline below: content is validated once at build time and turned into fully-typed data, so components get autocomplete and compile-time checking instead of guessing at YAML shapes. |
| **vite-ssg** | Prerenders every route to real static HTML at build time (see `dist/*.html`), which is what makes per-page `<title>`/description/Open Graph tags actually show up correctly when a link is shared (LinkedIn, Slack, etc.) and gives search engines real content instead of an empty SPA shell. |
| **vue-router** | A small, hand-written route table (`src/router.ts`) — not file-based routing, since there are under a dozen routes and a manual table is simpler to read than a routing convention. |
| **@unhead/vue** | Per-route meta tags (`src/head.ts`). |
| **Tailwind CSS + DaisyUI** | Styling. DaisyUI classes are used directly in templates — there's deliberately no component-wrapper layer around them, to avoid abstraction for its own sake. Swapping the CSS framework later would mean real work, and that trade-off was made on purpose. |
| **Material Symbols + simple-icons, as inline SVGs** | Icons are bundled as individual per-icon SVGs (not a webfont) and registered by name in `src/components/icon-registry.ts`. `AppIcon.vue` is the one place in the app that touches that registry, so swapping icon sets later means editing one file. |
| **js-yaml, gray-matter, markdown-it, zod** (build-time only) | The content pipeline (`scripts/build-content.ts`): YAML is parsed with js-yaml, Markdown frontmatter/body with gray-matter + markdown-it, and every parsed file is validated against a zod schema (`schemas/schema.ts`) before being turned into a typed module under `src/generated/`. A typo in a content file fails the build with a clear error instead of silently producing a blank section on the live site. None of these ship to the browser — components only ever import the already-generated, already-typed output. |
| **sanitize-html** (build-time only) | Applied specifically to GitHub README HTML, the one piece of rendered content not authored by the site owner. |
| **@anthropic-ai/sdk** (local tool only) | Powers `npm run generate:resume` (`scripts/generate-resume-content.ts`), which seeds `content/about/*` from an uploaded resume. Run manually by the site owner, never during `build`/`dev`, and never shipped to the browser — see "Generating about content from a resume" below. |
| **Vitest** | Tests the content pipeline's validation rules and the one shared composable (`tests/`). |
| **nginx** (Docker runtime image) | Serves the prerendered static files with security headers, alongside a Node process that rebuilds them live on content changes — see "Deploying" below. |

Deliberately **not** used: a headless/git-based CMS (plain Markdown/YAML files edited directly already satisfy "content lives in code"), Pinia/Vuex (there's no cross-cutting mutable state — page data is static and UI toggles are local `ref`s), and any client-side/runtime calls to GitHub or YouTube APIs (GitHub data is fetched once at build time; see below).

## Project structure

```
content/            Everything you edit: site config, resume data, project write-ups, etc.
                     Gitignored — this is your real data, never pushed. Seeded on first
                     `npm install` from content.example/ — see "Editing content" below.
content.example/    Tracked placeholder counterpart to content/, committed to git so a
                     fresh clone has something to build against.
media/              Images/video, served at /media — see media/README.md. Gitignored and
                     seeded the same way, from media.example/.
media.example/      Tracked placeholder counterpart to media/.
schemas/            Zod schemas + inferred types, shared by the build pipeline and the app
scripts/            Build-time content pipeline (Node, TypeScript, no bundler)
src/
  generated/        Build output of the content pipeline — never hand-edit, gitignored
  components/       Reusable UI pieces
  composables/      useDisclosure.ts — the one shared piece of UI state (open/closed toggling)
  pages/            One file per route
  layouts/          DefaultLayout.vue — nav + page shell
tests/              Vitest suite
docker/             Dockerfile, nginx.conf, and entrypoint.sh for deployment
```

## Editing content

Everything under `content/` is what you'll actually change to make this your
own site. `content/` and `media/` are both gitignored (see `.gitignore`) so
your real name, resume, and photos never end up in git — `npm install` (via
the `predev`/`prebuild` hooks, or run directly with `npm run init-content`)
copies the placeholder files from `content.example/`/`media.example/` into
`content/`/`media/` the first time, then leaves them alone on every
subsequent run, so it's safe to edit freely and re-run later without losing
anything. Edit the real files in `content/`/`media/`, not the `.example/`
copies.

- `content/site.config.yaml` — your name, domain, theme, HSTS settings, support links, and the `llm.enabled` flag (see "Deferred: LLM assistant" below).
- `content/home.md` — the landing page (`/`): frontmatter `name`, an optional `image` (path under `public/`, PNG with transparency recommended), and a `buttons` list (`label`, `to`, `style: primary|ghost`) for the calls to action; the Markdown body is the short pitch shown next to it.
- `content/about/*.yaml` + `summary.md` — the full resume page (`/about`): skills, education, experience, credentials, volunteer work, languages, and your bio. Instead of writing these by hand, you can seed them from an existing resume — see "Generating about content from a resume" below.
- `content/contact.yaml` — the `/contact` page: `email` (required), plus optional `phone`, `location`, and `resumeUrl` (a path under `public/` to a downloadable resume file). The page's name/title are pulled automatically from `content/about/summary.md` rather than repeated here, and its social row reuses `content/social/social.yaml`.
- `content/projects/*.md` — one Markdown file per project, all shown on the single `/projects` page. Everything below is optional and orthogonal — mix and match per project:
  - Frontmatter `title`, `summary`, `tags`, `order` — same as always.
  - `repo: {owner, repo}` — auto-fetches that repo's description, star count, and README from GitHub (replaces the hand-written body). Run `npm run fetch:github` after adding one to pull the data (cached in `content/.cache/`, gitignored along with the rest of `content/` — see below).
  - `repoUrl` — a plain link to a repo instead, with no auto-fetch (use this *or* `repo`, not both).
  - `url` — a live/demo link.
  - `videoUrl` — a YouTube URL, embedded on the project's page.
  - `thumbnail`, `progress` (0–100) — for an in-progress build; shows a thumbnail and progress bar on the card.
  - `content/projects/devlogs/<slug>/YYYY-MM-DD-*.md` — dated updates for any project (not just in-progress ones), shown as a timeline on its detail page.
- `content/links/links.yaml` + `content/social/social.yaml` — both rendered on the single `/links` page (a "Social" section on top, "Other Links" below); still two separate files since they're different shapes, just one page.
- `content/hobbies/*` — icon grid entries plus an optional Markdown file per hobby for the expanded detail panel. Each entry's optional `image` (a path under `media/hobbies/`) is displayed at a fixed 64×64px, scaled down to fit without cropping (`object-contain`) — a square image around 128–256px per side (2–4x the display size, for sharpness on high-DPI screens) is plenty; anything larger is just extra file weight with no visual benefit. If you skip `image`, the entry falls back to `icon` instead.

Every content file is validated against a schema in `schemas/schema.ts`
before the site builds — if you get something wrong, `npm run build` (or
`npm run dev`) will fail with a specific error pointing at the file and field.

Several of these are list-shaped YAML files (skills, education, experience,
credentials, volunteer, languages, links, social) and every one of them is
optional — if you don't have content for one, don't delete or truncate the
file down to nothing; leave it as `[]`. An empty file fails the build (the
YAML parser errors on genuinely empty input), while an explicit `[]` parses
fine and the corresponding section is simply omitted from the page instead of
showing a heading with nothing under it.

### Changing the theme

Styling is [DaisyUI](https://daisyui.com/) end to end — colors, corner
radius, control sizing, borders, depth, and noise all come from whichever
theme is active, not from one-off Tailwind utility classes. Which theme is
active is controlled by a single value: `theme.daisyTheme` in
`content/site.config.yaml`.

Out of the box, that's set to `"dark"`, one of DaisyUI's built-in themes, and
`src/layouts/DefaultLayout.vue` applies it via `data-theme`. There's no
in-app theme switcher — this is a one-time choice you make when you set up
your fork.

To use a **different built-in DaisyUI theme**, just change the value:

```yaml
theme:
  daisyTheme: "synthwave" # or "light", "night", "dracula", "corporate", ...
```

See [daisyui.com/docs/themes](https://daisyui.com/docs/themes) for the full
list of built-in theme names.

To use a **custom theme** instead, define one in `src/styles/main.css` —
there's a commented-out `@plugin "daisyui/theme" { ... }` block there
already as a starting point (values can be hand-tuned or generated at
[daisyui.com/theme-generator](https://daisyui.com/theme-generator/)).
Uncomment it, give it a `name` that isn't already a built-in DaisyUI theme
name (to avoid silently shadowing one), and set `theme.daisyTheme` in
`content/site.config.yaml` to that same name. DaisyUI resolves `data-theme`
by first checking custom themes defined via `@plugin "daisyui/theme"`, then
falling back to its bundled built-in theme of that name.

### Generating about content from a resume

```
npm run generate:resume -- path/to/resume.pdf              # accepts .pdf, .txt, or .md
npm run generate:resume -- path/to/resume.pdf --dry-run    # preview only, writes nothing
```

`scripts/generate-resume-content.ts` sends the resume to Claude
(`claude-opus-5`) and asks it to extract your name, title, summary, skills,
education, experience, credentials, volunteer work, and languages into the
exact shapes `schemas/schema.ts` expects. Every extracted section is
re-validated against those same schemas before anything is written, so a
bad or incomplete extraction fails loudly here instead of silently breaking
a later `npm run build`.

Running it **overwrites** `content/about/summary.md` and every
`content/about/*.yaml` file. Use `--dry-run` first to see what it would
produce without touching anything, and review the result (e.g.
`git diff content/about/`) before trusting it — treat the output as a first
draft to correct, not a finished bio. It's a manual, occasional tool: it
never runs as part of `npm run dev`/`build`, and it's the only piece of
this project that talks to an LLM at all.

It needs Claude API credentials, resolved automatically by the Anthropic
SDK — either:

- **A Claude Pro/Max subscription**: install the [`ant` CLI](https://platform.claude.com/docs/en/api/sdks/cli) (Anthropic's CLI — unrelated to the old Apache Ant Java build tool, despite the name) and run `ant auth login` once. No API key needed after that.
- **An API key**: set `ANTHROPIC_API_KEY` in your environment instead.

### `content/.cache/github-readmes.json`

That file is the *output* of `npm run fetch:github` — it's your real,
gitignored cache, seeded as an empty `{}` from
`content.example/.cache/github-readmes.json` like everything else under
`content/`. Run `npm run fetch:github` whenever you add or change a
`repo: {owner, repo}` project to (re)populate it; `docker build` reads
whatever's in your local `content/` at build time, so keep this cache
up to date locally before building an image so it doesn't need GitHub to be
reachable at build time.

## Development

```
npm install
npm run dev       # http://localhost:5173
npm test          # Vitest
npm run lint
npm run build     # full production build -> dist/
```

`npm run dev` and `npm run build` both seed `content/`/`media/` from the
`.example/` folders if they don't exist yet, then run the content pipeline
(`predev`/`prebuild` npm hooks), so `src/generated/` is always in sync with
whatever's in `content/`.

## Deploying (Docker)

`docker-compose.yml` bind-mounts your local `./content` and `./media`
directories into the container, so run `npm install` (or `npm run
init-content`) at least once first if you haven't already — otherwise those
mounts start out empty and the site has nothing real to serve.

```
npm install                 # first time only — seeds content/ and media/
npm run fetch:github        # refresh GitHub data
docker compose up --build
```

This builds a multi-stage image (Node typechecks and produces a seed static
build; the runtime stage has both Node and nginx) and mounts `./content` and
`./media` as read-only volumes, so you can edit content or add/replace
images/video without rebuilding the image. `docker/nginx.conf` sets CSP,
HSTS (generated from `content/site.config.yaml`, kept in sync with it both
at image-build time and on every live content rebuild — see below), and
other standard security headers.

**Content edits go live without a rebuild.** Inside the container,
`scripts/watch-content.ts` watches the mounted `content/` volume; on any
change it reruns the content pipeline, re-validates everything against
`schemas/schema.ts`, reprerenders the site with `vite-ssg build`, and — only
if all of that succeeds — atomically repoints nginx's webroot at the new
output (`scripts/rebuild-site.ts`). If a content edit is invalid, the
rebuild fails loudly in the container logs and the previous, still-valid
build keeps serving; nothing ever goes live half-built. This costs a few
seconds of latency between saving a file and seeing it live, in exchange for
keeping every safety property the static build already had. `media/` needs
no rebuild at all — it's served directly via nginx's `/media/` alias.

Because of this, the runtime image carries Node and the full `node_modules`
(not just nginx) — a deliberate tradeoff for live-editable content over the
smallest possible image.

`docker-compose.yml` also runs a `caddy` service in front of `web`
(`docker/Caddyfile`) that terminates TLS and auto-issues/renews Let's
Encrypt certs — `web` itself only serves plain HTTP internally and is no
longer published to the host directly. Update the domain(s) in
`docker/Caddyfile` if you're deploying this under a different domain.

## Refresh, `docker compose up --build`, or `npm run build`?

Which one you need depends on whether you're running the live Docker
deployment or developing locally, and which files you touched.

**Docker Compose (`docker compose up`), already running:**

| You edited | What to do |
|---|---|
| `content/**` | Nothing — `scripts/watch-content.ts` (inside the container) picks it up, reruns the content pipeline and `vite-ssg build`, and atomically swaps it live, usually within a few seconds. Watch `docker compose logs -f` for `[rebuild-site] live: ...`, then refresh the browser. |
| `src/styles/**` | Same as above — also bind-mounted and watched live. |
| `media/**` | Nothing, not even a rebuild — nginx serves it directly from the mounted volume. Just refresh. |
| Anything else (`src/` code, `scripts/*.ts`, `schemas/*.ts`, `package.json`, `Dockerfile`, `docker-compose.yml`, `docker/*`, `vite.config.ts`, `tsconfig*.json`, `index.html`) | `docker compose up --build`. Only `content/`, `src/styles/`, and `media/` are bind-mounted (see `docker-compose.yml`); everything else is baked into the image at build time, so the running container never sees the edit until the image is rebuilt. A plain `docker compose restart` won't pick it up either. |

**Local development (`npm run dev`), already running:**

- `src/**` (excluding `src/generated/`, which is build output) and `src/styles/**` — instant HMR, no action needed.
- `media/**` — served live from disk by `vite-media-plugin.ts`; just refresh.
- `content/**` — **not** watched during `npm run dev` (unlike the Docker setup). Rerun `node scripts/build-content.ts` (or restart `npm run dev`, since the `predev` hook reruns it for you) to regenerate `src/generated/`; Vite then hot-reloads the changed generated module automatically.

**`npm run build`** produces a one-off, non-live static build (`dist/`) and is
the only path that also runs `vue-tsc` type-checking — use it to sanity-check
before pushing, or to deploy a plain static build without Docker at all.

## Deferred: LLM career assistant

An optional "ask questions about my career" chat feature was scoped out of
this MVP on purpose, since it would need a backend component that the rest
of this project deliberately doesn't have. The seam for it already exists:
flip `llm.enabled: true` in `content/site.config.yaml` and
`src/components/LlmSlot.vue` is where it would render — everything else in
the app is unaffected either way.

## Known gaps / things to decide next

- **Languages placement**: the Home page puts spoken languages in their own
  collapsed section near Credentials/Volunteer — this wasn't pinned down as
  precisely as the rest of the layout during design, so revisit it once you
  see the real page.
- **Default OG image**: `content/site.config.yaml`'s `defaultOgImage` points
  at `/media/og-default.png`, which doesn't exist yet — add one before
  relying on link-preview images.
- Docker build/`docker compose up` has been reviewed carefully but not
  executed end-to-end in this environment (no Docker daemon access here) —
  run it yourself as the final check before deploying.
