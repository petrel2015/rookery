# Privacy

English | [简体中文](../zh/privacy.md) · Docs [index](./index.md) · Main [README](../../README.md)

This page states what the running application does with data. Every claim
below was checked line-by-line against the application source
(`index.html`, `src/main.js`, `src/App.vue`, `src/style.css`,
`src/components/ProjectCard.vue`, `src/data/projects.js`) on 2026-08-27.

## Local Storage

The application's only persistence is two `localStorage` keys. There are no
cookies, no IndexedDB, no Service Worker, and no file system access.

| Key | Values | Purpose | Lifetime |
| --- | --- | --- | --- |
| `pw-theme` | `'dark'` \| `'light'` | Remembers the manually chosen theme; written only when you click the toggle. Absent → system preference (`prefers-color-scheme`) decides. | Until site data is cleared in the browser; no expiry is set. |
| `pw-layout` | `'grid'` \| `'list'` | Remembers the chosen wall layout; written only when you click the view toggle. | Same as above. |

Clearing site data in your browser removes both keys; the app then falls
back to its defaults (system theme, grid layout).

## Network Behavior

- The application source contains **zero** runtime network APIs: no
  `fetch`, no `XMLHttpRequest`, no `WebSocket`, no `sendBeacon`, no
  analytics snippet, no third-party script tag.
- Loading the page requests only its own static files: the HTML document,
  one hashed CSS file, one hashed JS file, the favicon, and the cover
  images shown on screen (`public/covers/`, `loading="lazy"` — off-screen
  covers are not requested until you scroll).
- There is no backend to send anything to; the deployed artifact is a
  folder of static files.

## Third-Party Interactions

- No third-party service is embedded or contacted by the page itself.
- Network requests to third parties (GitHub repositories, the projects'
  live-demo sites) happen **only when you click an outbound link**. Those
  open in a new tab with `rel="noopener"`; from that point on you are on
  the destination site, subject to its own policies.

## Permissions

The application requests no browser permissions — no camera, microphone,
location, notifications, or clipboard.

## Notes

- If the wall is hosted on a service such as GitHub Pages, the **hosting
  provider's** access logs and analytics are outside this project's control
  and outside the scope of this page; the project itself ships no tracking.
- The statements above describe the application code as of v0.1.0
  (2026-08-27). If a future version adds runtime data collection, this page
  must be updated alongside it.
