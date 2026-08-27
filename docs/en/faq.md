# FAQ

English | [简体中文](../zh/faq.md) · Docs [index](./index.md) · Main [README](../../README.md)

### Is there an English interface?

No. The wall's UI is Chinese only (category chips, buttons, hero copy);
there is no language switcher as of v0.1.0. The documentation you are
reading is bilingual. Adding i18n is not on the roadmap — see
[Non-Goals in the data-driven wall design](./features/data-driven-wall.md#non-goals).

### Where is the online demo?

The site is not deployed yet (checked 2026-08-27). The build is a static
bundle; [Deployment](./deployment.md) has a one-page guide, and the README's
demo section will carry the URL once it exists.

### Can I use Rookery for my own projects?

The code is on GitHub, so you can fork it — but note that **no license has
been chosen yet** (see the README's License Notes): all rights are reserved
by default, so ask first (open an issue) if your use goes beyond personal
experimentation. Technically, adapting it means replacing
`src/data/projects.js` and `public/covers/` — nothing else is wired to any
specific project.

### Why do cover images live in this repository instead of hot-linking each project?

So the wall never breaks when a linked repository is renamed, its Pages
site moves, or it goes offline. Each cover is a copy taken from the
project's own `docs/img/`. See
[Data-Driven Wall](./features/data-driven-wall.md#solution-overview).

### What happens to a project without a screenshot?

It gets a generated placeholder cover: grid-paper background, the project's
initial (first Chinese character or first two Latin letters), and a red
dot. It looks intentional, not broken. See
[Usage · Cover image guidelines](./usage.md#cover-image-guidelines).

### Does the site collect any data about me?

No analytics, no cookies, no runtime network calls — the only things stored
are your theme and layout choices in `localStorage`. Details, including the
exact keys and how to clear them: [Privacy](./privacy.md).

### Can it be hosted under a subpath or a custom domain?

Yes to both — the build uses a relative base, so one `dist/` works at
`https://user.github.io/rookery/`, a custom domain, or any nested path
without rebuilding. Details: [Deployment](./deployment.md).

### Is there a backend, an API, or a GitHub integration?

No. All content comes from `src/data/projects.js` at build time. The wall
does not call the GitHub API at runtime and does not fetch repository data.

### Does it work offline / is it a PWA?

No. There is no Service Worker and no offline mode beyond the browser's
normal cache. "Offline" claims sometimes made for the wall's *listed
projects* (e.g. QR·STUDIO) refer to those projects' own capabilities, not
to Rookery itself.

### Why is a category I want missing (e.g. "Articles" or "Design")?

Categories are a fixed set (`ext` / `tool` / `game`) defined alongside the
data. Adding one is a one-line edit to `CATEGORIES` plus per-project
re-categorization — deliberately a code change, not a runtime feature. See
[Current Limitations](./features/data-driven-wall.md#current-limitations).
