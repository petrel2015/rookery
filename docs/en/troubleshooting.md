# Troubleshooting

English | [简体中文](../zh/troubleshooting.md) · Docs [index](./index.md) · Main [README](../../README.md)

Symptoms observed or directly derivable from the code, ordered by how often
they are likely to occur. If nothing here helps, open a GitHub issue with:
browser + version, OS, the URL you are on, and the browser console output.

## Common Problems

| Symptom | Likely cause → check in this order | Fix |
| --- | --- | --- |
| `npm run dev` prints a port other than 5180 (e.g. 5181) | Port 5180 already in use; Vite picks the next free port because `strictPort` is not set | Use the URL Vite printed. To free the port: `lsof -nP -iTCP:5180 -sTCP:LISTEN`, then stop the listed process. Point helper scripts at the real port via `BASE_URL`. |
| `scripts/verify.mjs` or `shot.mjs` exits with "未找到可用的 Chromium" | No Chromium at the auto-detected Playwright cache path (`~/Library/Caches/ms-playwright/chromium-1223/...`) — different machine, or a different browser-cache revision | Set `CHROMIUM_PATH=/path/to/Chrome` to any Chrome/Chromium executable, or install the matching Playwright browser cache. |
| A newly added project does not appear | ① Syntax error in `src/data/projects.js` (Vite shows an error overlay / console message) → ② record appended outside the `PROJECTS` array → ③ file not saved | Fix the syntax, confirm the record sits inside `PROJECTS`; Vite hot-reloads on save. |
| Card renders the grid-paper placeholder although `cover` is set | ① Cover file missing from `public/covers/` → ② path typo (must be relative, no leading slash, exact filename incl. extension) → ③ `dist/` stale after adding the image to an already-built copy | Verify the file exists under `public/covers/`, the record says `covers/<exact-name>`, and rebuild (`npm run build`). |
| Covers return 404 on a self-hosted `dist/` | The server's document root does not include the copied `public/` assets (only `index.html` + `assets/` uploaded), or the server rewrites paths | Upload the **entire** `dist/` directory; check `dist/covers/` exists post-build; no rewrite rules are needed. |
| Deployed page loads but JS/CSS 404 | The build was produced with an absolute base (someone changed `base` from `'./'`), or files were uploaded with an extra nesting level | Keep `base: './'` in `vite.config.js`; upload `dist/` contents so `index.html` and `assets/` are siblings. |
| Theme or view choice does not survive a reload | `localStorage` unavailable — private-browsing restrictions, or the page is embedded in a sandboxed iframe | Expected degradation: the app falls back to the system color-scheme preference and default grid layout; the pre-paint restore script is wrapped in try/catch so the page still renders. |
| Layout/behavior regression suspected | — | Run `node scripts/verify.mjs` against the suspect instance (`BASE_URL=...`); it checks card count, image loading, overflow, columns, equal heights, filter, views, dark mode, mobile, and console cleanliness. |
