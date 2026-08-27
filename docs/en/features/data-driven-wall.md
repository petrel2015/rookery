# Data-Driven Wall

English | [简体中文](../../zh/features/data-driven-wall.md) · Feature [index](./index.md) · Main [README](../../../README.md)

## Summary

The entire wall — every card, category, count, and link — renders from one
plain JavaScript file (`src/data/projects.js`); no component hardcodes any
project information.

## Background

Personal side projects accumulate across repositories. The conventional
fix is a "my projects" list in a profile README — plain links, no pictures,
and it decays: adding an entry means editing prose, and the entry says
nothing about what the thing looks like. Full-blown portfolio CMSes solve
this but drag in accounts, databases, and runtime services that a static
showcase does not need.

## Problem

Concretely, with a hand-maintained page:

1. Adding a project touches markup in multiple places (card, counts,
   category sections) — every edit is a chance to break layout.
2. A project without a decent screenshot blocks publishing, because an
   empty image box looks broken.
3. Content and presentation intertwine, so a fork by someone else means
   reverse-engineering components before they can list their own work.

## Goals

- Adding (or removing) a project = appending (deleting) one record in one
  file, plus one image file — no component edits.
- The wall renders correctly for a record with **no cover image** and
  **no live demo**; neither is an error state.
- Cover images ship with the wall, so rendering never depends on the
  availability of the linked repositories.
- The same build works at any hosting path (relative base) — forking and
  self-hosting must be zero-config.
- Zero backend, zero runtime data fetching, zero build-time content
  pipeline beyond Vite itself.

## Non-Goals

- **No CMS and no admin UI.** The data file *is* the interface; editing it
  in a text editor is the intended workflow.
- **No GitHub API integration at runtime.** Repository metadata (stars,
  descriptions, topics) is deliberately not fetched — the wall must work
  offline-of-GitHub and stay free of rate limits and tokens.
- **No i18n layer.** The UI copy is Chinese; translating it is out of scope
  for this design.
- **No dynamic categories or tagging system.** Exactly three categories
  (`ext` / `tool` / `game`) fit the owner's actual output; a free-form tag
  system would add UI for no browsing benefit at this scale.
- **No search or sorting.** At 12 items, filter chips are sufficient.
- **No scheduled rebuilds** (e.g. daily CI rebuilds to refresh covers).
  The wall changes when the owner changes it.

## Solution Overview

`src/data/projects.js` exports two plain constants — `CATEGORIES`
(id + label) and `PROJECTS` (an array of records; fields documented in
[Usage](../usage.md#project-record-fields)). `App.vue` holds the two pieces
of UI state (active category, layout) and derives the visible cards with a
single `computed` filter; `ProjectCard.vue` renders one record in either
layout. Nothing else in the codebase mentions a specific project.

Covers live in `public/covers/` and are referenced by relative path
(`covers/x.webp`), so Vite copies them into the build and they resolve
under any subpath — together with `base: './'`, this is what makes the
build host-agnostic.

The placeholder cover is pure CSS (repeating linear-gradient grid at 22 px)
plus the record's `name` — first Chinese character if present, else the
first two Latin letters, uppercased.

User preferences (theme, layout) persist via `localStorage`; the theme is
restored by an inline script in `index.html` before first paint to avoid a
light-mode flash for dark-mode users.

## Detailed Behavior

- **Defaults.** Fresh visitor: category `all`, layout `grid`, theme from
  `prefers-color-scheme`.
- **Link resolution.** Card title and cover point at `demo || github`;
  the GitHub button always points at `github`. Both open in new tabs with
  `rel="noopener"`.
- **Counts.** Chip counts are computed from the array (`all` = length,
  others = filtered length) — they cannot disagree with the data.
- **Empty states.** Empty `cover` → placeholder; empty `demo` → GitHub-only
  buttons; a category with zero records → "该分类暂无项目。" message.
- **Clamping.** `desc` clamps to 3 lines (grid) / 2 lines (list) via
  `-webkit-line-clamp`, so record length never breaks card equal-height.
- **`coverFit`.** `'cover'` (default) fills the 16:10 box; `'contain'`
  centers with 14% padding for icon-like assets.
- **Errors.** A malformed record (e.g. missing `github`) is not caught
  gracefully — the page still renders other cards because Vue's rendering
  is per-component, but expect a console error. Data quality is guarded by
  review, not runtime validation.
- **Images.** Covers use `loading="lazy"`; the assertion script verifies
  every registered cover actually loads (`naturalWidth > 0`).

## User Experience

- Filter chips and the view toggle sit in a sticky toolbar (desktop),
  so they stay reachable while scrolling the wall.
- Switching category or layout runs a 160 ms fade transition
  (`transition` with `mode="out-in"`), avoiding a jarring reflow.
- Cards lift 3 px on hover with a subtle shadow; the title arrow animates
  toward the accent color; the cover scales 1.025× — cheap, quiet feedback.

  ![Wall overview](../../img/overview-grid-light.webp)

- The placeholder cover is designed to look like an intentional editorial
  choice (grid paper + initial + red dot), not a failure state.

  ![Placeholder cover](../../img/cover-fallback.webp)

## Compatibility and Historical Impact

No historical behavior is affected. This design is the initial
architecture of the project as first published (v0.1.0, 2026-08-27);
there is no earlier data format to migrate.

## Data and Privacy Impact

The design adds exactly the two `localStorage` keys (`pw-theme`,
`pw-layout`) and no network behavior. The data file itself contains only
public information (names, descriptions, public URLs). For the full audit,
see [Privacy](../privacy.md).

## Performance Impact

The data module is bundled into the single JS chunk (whole app at v0.1.0:
80.5 kB raw / 33.77 kB gzipped including Vue; CSS 8.55 kB / 2.32 kB
gzipped). Rendering is one `computed` filter over ≤ dozens of items — no
virtualization needed at this scale, and none is planned (see Non-Goals).
Cover images dominate page weight; they are lazy-loaded and WebP is the
recommended format.

## Current Limitations

(Things not done yet, as opposed to the Non-Goals above, which are
deliberate refusals.)

- Category labels are Chinese only, since no i18n layer exists.
- No runtime validation of records; a typo fails visibly in the browser
  console rather than in a build step.
- Cover images must be copied manually from source repositories; there is
  no automation.
- The assertion suite (`scripts/verify.mjs`) hardcodes the current seeded
  count (12 cards / 11 covers) and needs updating when the data grows.

## Release Information

- Introduced: v0.1.0
- Status: Stable

## Related Documentation

- [Usage](../usage.md#adding-a-project) — the record-field reference and
  the add-a-project walkthrough.
- [Development](../development.md#the-assertion-script-scriptsverifymjs) —
  how the layout invariants are asserted.
- [Privacy](../privacy.md) — the storage/network audit.
- [Deployment](../deployment.md) — why the relative base matters for
  hosting.

## Feature Changelog

### v0.1.0

- Initial release: single-file data model, category filter with computed
  counts, grid/list layouts, placeholder covers, `coverFit` option,
  localStorage preferences.
