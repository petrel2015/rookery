# Deployment

English | [简体中文](../zh/deployment.md) · Docs [index](./index.md) · Main [README](../../README.md)

## Current Status

**Not deployed** as of 2026-08-27: `https://petrel2015.github.io/rookery/`
returns 404, and the repository contains no deploy workflow yet. The build
is ready for static hosting as-is; this page is the recipe.

## What Gets Deployed

`npm run build` produces `dist/`:

- `index.html` — asset URLs rewritten relative (`./assets/...`) because
  `vite.config.js` sets `base: './'`.
- `assets/` — hashed JS/CSS bundles.
- `covers/`, `favicon.svg` — copied verbatim from `public/`.

Total footprint at v0.1.0: roughly 90 kB of code assets (before cover
images; ~36 kB gzipped) plus the cover images in `public/covers/`.

## Subpath Handling (why any URL works)

Everything is relative:

- Bundled JS/CSS reference `./assets/...` — resolved against the page URL.
- Cover paths in the data file are relative (`covers/x.webp`, no leading
  slash), so at `https://user.github.io/rookery/` they resolve to
  `https://user.github.io/rookery/covers/x.webp`.
- `index.html` references `./favicon.svg` the same way.

No environment-specific rebuild is needed for `github.io/<repo>/`, a custom
domain, or a nested path — one build works everywhere. This was verified by
serving `dist/` under a `/rookery/` prefix locally during the documentation
pass: all 12 cards rendered, 11 covers loaded, zero console errors.

## Deploying to GitHub Pages

### Option A — classic branch deploy (no workflow file needed)

1. Build locally: `npm run build`.
2. Publish `dist/` to the hosting branch — e.g. with
   [gh-pages](https://www.npmjs.com/package/gh-pages):
   `npx gh-pages -d dist`.
3. Repository **Settings → Pages** → Source: `gh-pages` branch, `/ (root)`.

### Option B — GitHub Actions (recommended long-term)

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Add a workflow (`.github/workflows/deploy.yml`) that runs
   `npm ci && npm run build` on push to `main` and uploads `dist/` with the
   official `actions/upload-pages-artifact` / `actions/deploy-pages`
   actions. (Not included in the repo yet — see Remaining issues in the
   project docs.)
3. Optionally add a CI job step running
   `BASE_URL=<preview URL> node scripts/verify.mjs` after deployment.

## Custom Domain

Works without rebuilds (relative base). In GitHub Pages: add a `CNAME` file
to `public/` with the domain, point your DNS (`CNAME` to
`<user>.github.io` or A records to Pages IPs), and enable
**Enforce HTTPS** once the certificate is issued. Remove the `CNAME` file
if you go back to the default URL.

## Post-Deployment Verification Checklist

- `curl -s -o /dev/null -w '%{http_code}' https://<host>/<path>/` → `200`
  (note the trailing slash; without it GitHub Pages redirects).
- Spot-check one cover:
  `curl -s -o /dev/null -w '%{http_code}' https://<host>/<path>/covers/nback.webp` → `200`.
- Open the site in a browser: 12 cards, images render, toggle dark mode and
  reload (theme persists, no white flash), switch to list view.
- Full automated pass:
  `BASE_URL=https://<host>/<path>/ node scripts/verify.mjs` → 11/11.

## Other Static Hosts

Any web server or CDN works (nginx, Caddy, Netlify, Cloudflare Pages,
object storage static hosting): upload the contents of `dist/` and serve
`index.html` for the root path. There is no server-side rendering, no
rewrite rules required, and no environment variables to set.
