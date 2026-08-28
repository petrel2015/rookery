# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1./),
and the project follows [Semantic Versioning](https://semver.org/).

> **About version history:** this repository has exactly one commit
> (2026-08-27), no Git tags, and no GitHub releases — checked via
> `git tag`, `git ls-remote --tags`, and the GitHub releases page.
> Therefore no finer-grained per-release history exists; the entry below
> summarizes the complete capability set of the initial revision. See
> `git log` for raw history. Future changes will be recorded here per
> release as tags are created.

## [Unreleased]

### Changed

- Category chips now split by demo availability: 全部 / 可在线试用 /
  仅看介绍 (12 / 9 / 3, based on whether a `demo` link is set). The
  `category` field is kept for the card badge and hero stats only —
  it no longer participates in filtering.

## [0.1.0] - 2026-08-27

First public revision. First released 2026-08-27; this entry summarizes the
complete feature set as of this version.

### Added

- Personal project wall rendered from a single data file
  (`src/data/projects.js`) — 12 seeded projects (2 extensions & apps,
  7 online tools, 3 games); the UI hardcodes no project information.
- Grid / list dual views: image-top card wall (responsive: 3–4 columns on
  desktop, 2 on tablet, 1 on mobile) and image-left / text-right rows;
  the choice persists in `localStorage` (`pw-layout`).
- Category filter with live counts: All / Extensions & Apps / Online Tools /
  Games.
- Dark mode: manual toggle, system-preference default, persisted
  (`pw-theme`); inline pre-paint theme restore prevents white flash.
- Cover fallback: projects without a screenshot get a generated grid-paper
  placeholder with the project's initial; `coverFit: 'contain'` option for
  app-icon style covers.
- Per-card GitHub and live-demo links; the demo link label is customizable
  per record (`demoLabel`).
- Swiss International Style design system (paper white / ink black / one
  red accent) with light and dark themes.
- Developer tooling: `scripts/verify.mjs` (11 layout & behavior assertions
  via playwright-core) and `scripts/shot.mjs` (verification screenshots).
- Vite build with relative base (`./`) for subpath-safe static hosting.
