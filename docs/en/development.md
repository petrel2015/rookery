# Development

English | [简体中文](../zh/development.md) · Docs [index](./index.md) · Main [README](../../README.md)

## Prerequisites

- **Node.js 18+** (required by Vite 5). Verified with Node v22.22.3 /
  npm 10.9.8. There is no `engines` field in `package.json`.
- Optional, for the browser-driven scripts: a local Chromium build. The
  scripts auto-detect the Playwright browser cache at
  `~/Library/Caches/ms-playwright/chromium-1223/...` (macOS arm64 paths);
  override with the `CHROMIUM_PATH` environment variable pointing at any
  Chrome/Chromium executable.

## Commands

All commands below were actually executed and their results recorded during
the documentation pass (2026-08-27).

| Command | What it does | Verified result |
| --- | --- | --- |
| `npm ci` | Clean install from `package-lock.json` | 72 packages, ~2 s |
| `npm run dev` | Vite dev server on port **5180** | 200 OK; hot reload working |
| `npm run build` | Production bundle into `dist/` | ✓ built in 373 ms — `index.html` 0.89 kB, CSS 8.55 kB (2.32 kB gzip), JS 80.5 kB (33.77 kB gzip) |
| `npm run preview` | Serves `dist/` on port **4173** | 200 OK |
| `node scripts/verify.mjs` | 11 layout & behavior assertions (see below) | 11/11 pass against both dev and preview |
| `node scripts/shot.mjs` | 4 verification screenshots into `shots/` (gitignored) | works against a running server |

Port note: `vite.config.js` sets `server.port: 5180` without `strictPort`,
so if 5180 is occupied Vite silently picks the next free port (observed:
5181). Always read the startup output for the real URL; the helper scripts
accept `BASE_URL` to point elsewhere (see Environment variables).

## The assertion script (`scripts/verify.mjs`)

Drives a real headless Chromium via `playwright-core` and checks:

1. 12 cards render (matches the seeded data file).
2. All 11 registered cover images actually load (`naturalWidth > 0`; the
   12th project intentionally has no cover).
3. No horizontal overflow on desktop.
4. Desktop grid has 3 columns at 1440 px.
5. Cards in the same grid row are equal height.
6. Filtering to 游戏 (Games) shows exactly 3 cards.
7. List view switch applies to all 12 cards.
8. Dark mode toggle adds the `dark` class to `<html>`.
9. Mobile viewport (390 px): single column, no horizontal overflow.
10. Zero console errors / page errors during the whole run.

Exit code 0 only when everything passes — suitable for CI later. Usage:

```bash
npm run dev                              # terminal 1
BASE_URL=http://localhost:5180/ node scripts/verify.mjs   # terminal 2
# or against the production artifact:
npm run build && npm run preview
BASE_URL=http://localhost:4173/ node scripts/verify.mjs
```

## Lint status

There is **no lint configuration** in the repository (no ESLint,
Stylelint, or Prettier config; no `lint` script). Code style is by
convention — match the existing files.

## Dependency audit status

`npm audit` (2026-08-27, lockfile as of v0.1.0) reports **2 advisories,
1 moderate + 1 high**, both in the dev toolchain:

- `esbuild <= 0.24.2` (moderate, GHSA-67mh-4wv8-2f99): a malicious website
  can read responses from a running `vite dev` server.
- `vite <= 6.4.2` (high): flagged for depending on the vulnerable esbuild.

Both affect the **development server only** — the shipped artifact is a
static `dist/` bundle with no dev server involved. The suggested `npm audit
fix --force` would install Vite 8 (a breaking upgrade); the maintainer has
not taken it. Practical mitigation: don't leave `npm run dev` running on
untrusted networks.

## Directory structure

```
├── index.html                  entry page; inline pre-paint theme restore
├── vite.config.js              vue plugin, base './' (subpath-safe), port 5180
├── public/
│   ├── favicon.svg
│   └── covers/                 cover images bundled with the wall
├── src/
│   ├── main.js                 createApp(App).mount('#app')
│   ├── App.vue                 page shell: topbar, hero, toolbar (chips +
│   │                           view toggle), wall, footer; filter computed
│   ├── style.css               design tokens (light/dark) + Swiss-style base
│   ├── components/
│   │   └── ProjectCard.vue     one card; grid/list layouts; placeholder cover
│   └── data/
│       └── projects.js         PROJECTS + CATEGORIES — the only data source
├── scripts/
│   ├── verify.mjs              11 assertions (playwright-core)
│   └── shot.mjs                4 screenshots into shots/ (playwright-core)
└── docs/                       this documentation (en/zh + img/)
```

## Environment variables

Neither the app nor the build reads any environment variables. The two
helper scripts do:

| Variable | Used by | Meaning |
| --- | --- | --- |
| `BASE_URL` | `verify.mjs`, `shot.mjs` | Target URL; defaults to `http://localhost:5180/`. |
| `CHROMIUM_PATH` | `verify.mjs`, `shot.mjs` | Explicit path to a Chrome/Chromium executable, overriding the auto-detected Playwright cache path. |

## Verifying a production build locally

The exact recipe used during the documentation pass:

```bash
npm ci                       # clean install
npm run build                # dist/ produced
npm run preview              # serves dist/ at http://localhost:4173/
BASE_URL=http://localhost:4173/ node scripts/verify.mjs   # 11/11 pass
```

To also simulate subpath hosting (as GitHub Pages `/rookery/` would serve
it): put `dist/` behind any static server under a `/rookery/` prefix — the
relative base means nothing needs rebuilding. This exact setup was used to
capture the screenshots in `docs/img/` (all covers loaded, zero console
errors). See [Deployment](./deployment.md).
