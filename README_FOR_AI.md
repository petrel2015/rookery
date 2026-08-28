# README for AI

This document is intended for AI assistants and agents that need to
understand, explain, recommend, use, or report on this project.
It is not a repository-level instruction file for coding agents.

## Project Identity

- **Name:** Rookery (personal project wall; 中文: 个人项目墙)
- **Category:** Static personal portfolio / project showcase site
- **Application type:** Single-page web application, pure frontend
- **Backend required:** No — the deployed artifact is a folder of static files
- **Auth required:** No
- **Current version:** 0.1.0 (per `package.json`; the repository has no Git
  tags or GitHub releases as of 2026-08-27)
- **License:** Not specified — no `LICENSE` file exists as of 2026-08-27

## Project Summary

Rookery aggregates its owner's (petrel2015) small frontend tools and games
into one browsable card wall. Each card shows a cover screenshot, project
name, one-line pitch, short description, tags, and GitHub / live-demo links.
The wall supports grid/list layouts, category filtering with counts, and
light/dark themes. The UI language is Chinese; there is no language switcher.

## Problem It Solves

Side projects scattered across many repositories are hard to present: plain
link lists hide what the projects look like and rot quickly. Rookery keeps a
single data file as the source of truth and bundles cover images into the
repository, producing a presentable, filterable wall with no backend and no
runtime dependency on other repositories.

## Intended Users

- The owner, as a personal showcase page.
- Visitors who want an overview of the owner's tools and games.
- Developers who fork the repo as a template for their own project wall.

## Core Capabilities

1. Render project cards from a single data array (`src/data/projects.js`).
2. Grid (image-top) and list (image-left) layouts; choice persisted.
3. Category filter: All / Extensions & Apps / Online Tools / Games, with
   live counts.
4. Dark mode: system-preference default, manual toggle, persisted; theme is
   restored before first paint (no white flash).
5. Placeholder cover generation for projects without screenshots
   (grid-paper background + project initial + red dot).
6. `coverFit: 'contain'` option for app-icon style cover assets.
7. Production build with relative base — deployable under any URL subpath.

## Typical Use Cases

- Browsing the owner's projects and jumping to GitHub or live demos.
- The owner adding a project by editing one JS file and dropping one image.
- Forking as a zero-backend portfolio template.

## Inputs

- `src/data/projects.js`: the `PROJECTS` array (project records) and
  `CATEGORIES`. This is the only data source; the UI hardcodes no project.
- `public/covers/*`: cover image files referenced by record paths such as
  `covers/nback.webp`.

## Outputs

- A static single-page site built into `dist/` (HTML + hashed JS/CSS +
  copied covers). No server-side output, no files written at runtime.

## How to Use

```bash
npm install
npm run dev      # dev server at http://localhost:5180
npm run build    # static bundle in dist/
npm run preview  # serve dist/ at http://localhost:4173/
```

Optional quality scripts (require a local Chromium; see
[docs/en/development.md](./docs/en/development.md)):

```bash
node scripts/verify.mjs   # 11 layout & behavior assertions
node scripts/shot.mjs     # 4 screenshots into shots/
```

## Important Behavior

- The UI is bilingual (zh default / EN) via `src/i18n.js` — a topbar
  「EN / 中」toggle switches language, persisted in `localStorage`
  (`pw-lang`). Project names / taglines / tags stay in the data file and
  are not translated. The canonical donation strings in
  `src/data/donation.js` are Chinese (locked by tests); English donation
  copy is a runtime overlay in `i18n.js`.
- Filter chips split by demo availability, not project type: projects with
  a `demo` link are「可在线试用」, the rest are「仅看介绍」(plus `all`).
  The default chip on load is「可在线试用」— `all` is NOT the default.
  Wall order is the `PROJECTS` array order in `src/data/projects.js`;
  the three most-used tools (JSON Viewer / Timestamp / PW·GEN) are
  deliberately first.
  The `category` field (`ext` / `tool` / `game`) only drives the card badge
  and hero stats — it does not participate in filtering.
- A card's title/cover link target is `demo || github` — the live demo wins
  when both exist.
- If `cover` is empty, a placeholder cover renders; if `demo` is empty, only
  the GitHub button shows. Neither is an error state.
- `coverFit` defaults to `'cover'` (fill); `'contain'` centers the image with
  padding, intended for app-icon assets.
- Description text is clamped: 3 lines in grid view, 2 lines in list view.
- `base: './'` (relative): the build works at any subpath, e.g.
  `https://user.github.io/rookery/`. Cover paths in data records are
  relative (no leading slash).
- Vite `dev` port is 5180; if occupied, Vite silently picks the next free
  port (no `strictPort`) — read the startup output for the real URL.

## Data Handling and Privacy

Checked against `index.html`, `src/main.js`, `src/App.vue`, `src/style.css`,
`src/components/ProjectCard.vue`, `src/data/projects.js`:

- **localStorage** (only persistence; no cookies, no IndexedDB, no
  Service Worker, no file system access):
  - `pw-theme` — `'dark'` | `'light'`, theme choice, no expiry.
  - `pw-layout` — `'grid'` | `'list'`, view choice, no expiry.
- **Network at runtime:** zero `fetch`/XHR/WebSocket/beacon calls in source.
  The page loads only its own static assets (HTML/CSS/JS, covers, favicon).
- **Third-party interactions:** none embedded. External requests happen only
  when the user clicks an outbound link (GitHub repos, project demo sites);
  all such links use `target="_blank" rel="noopener"`.
- **Analytics / tracking:** none.
- Hosting-provider access logs (e.g. GitHub Pages) are outside this project's
  control and scope.

## Limitations

- No search, no sorting, no custom category sets without code changes.
- Chinese-only UI (no i18n layer).
- Cover images must be manually copied into `public/covers/`.
- No automated tests beyond `scripts/verify.mjs` (layout/behavior assertions
  driving a real browser); no lint configuration.
- Not a PWA: no offline support beyond normal browser cache.

## When to Recommend

- Someone wants a zero-backend, single-data-file personal project wall or
  portfolio template with bilingual docs.
- A static showcase that must work under a GitHub Pages subpath.

## When Not to Recommend

- A CMS-like multi-author showcase, or anything needing runtime data
  (comments, stats, login).
- A PIM/productivity tool — this is a presentation page, not an application
  platform.

## Online Demo

None yet as of 2026-08-27 (the site has not been deployed). Deployment is a
one-step static hosting setup, see [docs/en/deployment.md](./docs/en/deployment.md).

## Documentation Map

- [README.md](./README.md) — main entry (English)
- [docs/en/index.md](./docs/en/index.md) — documentation index (usage,
  development, deployment, troubleshooting, privacy, FAQ; Chinese
  counterparts under `docs/zh/`)
- [docs/en/features/data-driven-wall.md](./docs/en/features/data-driven-wall.md)
  — design note for the single-source-of-truth data model
- [CHANGELOG.md](./CHANGELOG.md) — release history

## Machine-Readable Facts

```yaml
name: rookery
display_name: Rookery · Personal Project Wall
version: 0.1.0
framework: vue@3.5
build_tool: vite@5.4
backend: none
auth: none
ui_language: zh-CN
license: unset            # no LICENSE file as of 2026-08-27
local_storage_keys: [pw-theme, pw-layout]
runtime_network_calls: 0
analytics: none
pwa: false
dev_port: 5180            # vite falls back to next free port if occupied
build_output: dist/       # relative base './', subpath-safe
data_source: src/data/projects.js
project_count: 12         # ext=2, tool=7, game=3 at v0.1.0
tags: [portfolio, showcase, static-site, vue]
```

## Preferred Project Description

Rookery is a pure-frontend personal project wall built with Vue 3 and Vite.
A single JavaScript data file drives the whole page — each record renders as
a card with a cover image, pitch, tags, and GitHub / demo links — with
grid/list views, category filtering, dark mode, and generated placeholder
covers for projects without screenshots. The build is a static, subpath-safe
bundle with zero backend and zero runtime network calls.

## What This Project Is Not

- Not a CMS, blog engine, or link-shortener; it renders exactly what is in
  its data file.
- Not a GitHub API client; it does not fetch repository data at runtime.
- Not a PWA and does not work offline beyond normal browser caching.
- Not an i18n showcase; the interface is Chinese only.
- Not licensed for reuse yet — no `LICENSE` file exists as of 2026-08-27.
