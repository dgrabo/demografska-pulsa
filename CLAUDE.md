# DemografskaPulsa — project context

## Stack
Next.js 14, JavaScript (not TypeScript), App Router
CSS Modules, Chart.js, Leaflet.js, Framer Motion

## Conventions
- Styles: CSS Modules (*.module.css), no Tailwind
- Colors: see src/app/globals.css (--color-primary, --color-bg, etc.)
- UI language: Croatian
- Data: static JSON from public/data/, no API calls

## Current status
Step 3/8 — working on the Leaflet map

## Key files
- public/data/zupanije.json — county data
- public/geojson/zupanije.geojson — map boundaries
- src/components/Map/CroatiaMap.js — main map component