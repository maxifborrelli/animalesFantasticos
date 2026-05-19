---
description: "Use when: editing screens or UI components (src/features/**, src/app/**/page.tsx)."
applyTo:
  - "src/features/**"
  - "src/app/**/page.tsx"
---

- Treat src/app as route entrypoints only; real screens live under src/features/<feature>/pages.
- Keep page.tsx wrappers thin and delegate to the feature screen.
- API calls go through fetch to /api/<feature>; always set Content-Type for POST and check response.ok.
- Show API errors in the UI with a clear message; do not silently fail.
- Keep shared UI logic/components scoped to features; only extract to shared areas if reused across features.
- Leaflet CSS is imported in src/app/page.tsx and Leaflet icons are configured via CDN; avoid moving those.
