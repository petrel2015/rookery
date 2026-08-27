# Rookery · Personal Project Wall

English | [简体中文](./README.zh.md)

> **rookery** — the crowded cliff where petrels (seabirds) nest and breed. Every project here is a petrel; this is where they all live.

A pure-frontend (Vue 3 + Vite, zero backend) personal project wall: each card shows a cover screenshot, project name, one-line pitch, description, and GitHub / live-demo links.

## Features

- **Grid / list dual views** — grid is an image-on-top card wall (responsive: 3–4 columns on desktop, 2 on tablet, 1 on mobile); list is image-left / text-right rows.
- **Category filter** — All / Extensions & Apps / Online Tools / Games, with counts.
- **Dark mode** — manual toggle, follows system preference by default, persisted.
- **Cover fallback** — projects without a screenshot get a generated grid-paper placeholder cover.

## Develop

```bash
npm install
npm run dev     # http://localhost:5180
npm run build   # output in dist/, relative base
```

## Adding a project

Drop a cover image into `public/covers/`, then append one record in `src/data/projects.js`. See the Chinese README for a concrete template.

## Deploy

Static output — host on GitHub Pages or any static server.
