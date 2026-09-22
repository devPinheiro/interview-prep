# FrontVault

Personal frontend interview study vault — **Quiz · DSA · System Design · Behaviour · Negotiation** — from beginner to principal.

Inspired by the calm, question-first UX of [GreatFrontEnd](https://www.greatfrontend.com/). Progress stays in your browser (IndexedDB).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3456](http://localhost:3456) (dev uses port **3456**).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server (webpack, port 3456) |
| `npm run dev:turbo` | Dev with Turbopack (faster, less stable on some setups) |
| `npm run build` | Production build |
| `npm run build:clean` | Delete `.next` then build (fixes stale Turbopack artifacts) |
| `npm run ingest` | Dedupe harvested YAML titles → `content/catalog/generated.yaml` |
| `npm run catalog:generate` | Build large curated title bank → `content/catalog/bulk.json` |
| `npm run catalog:select` | Pick 1999 new stubs → `bulk-1999.json` (synced into app) |
| `npm run content` | Run Velite (markdown notes) |

## Content model

- **Ready questions** live in `src/content/*.ts` (original answers + optional Sandpack files).
- **Catalog stubs** merge hand harvest + `bulk-1999.json` (1,999 curated titles) with authored topics (deduped by `canonicalTopic`).
- Export/import progress from **Data** in the nav.

## Legal

Harvest files contain **titles + links only**. Do not scrape or republish GeeksforGeeks, Toptal, GreatFrontEnd, or other copyrighted solutions.
