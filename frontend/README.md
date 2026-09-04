# PS-3 Warehouse Network — Frontend

A logistics operations frontend for India's agricultural warehouse and cold-storage network.
Built in React + TypeScript + Vite, consuming a FastAPI backend with mocked fallbacks.

## Quick Start

```bash
cd inventory-frontend
npm install --legacy-peer-deps
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 5 | Dev server + bundler |
| Tailwind CSS | 4 | Styling (token-driven via CSS @theme) |
| Framer Motion | 13 | Animations, page transitions |
| TanStack Query | 5 | API calls, caching, loading states |
| React Router | 7 | Client-side routing |
| react-simple-maps | 3 | Interactive India map |
| Recharts | 3 | Dashboard charts |
| @splinetool/react-spline | 4 | 3D hero scene (Tier 1) |

## Project Structure

```
src/
├── styles/tokens.ts        # Single source of truth: colors, fonts, spacing, shadows
├── types/index.ts          # TypeScript types matching FastAPI schemas
├── mocks/data.ts           # Realistic mock data (all endpoints)
├── api/hooks.ts            # React Query hooks (toggle mock vs live per hook)
├── components/
│   ├── ui/                 # Shared primitives: Button, Card, Badge, Skeleton, etc.
│   ├── map/IndiaMap.tsx    # Interactive India map component
│   ├── hero/               # Spline hero wrapper (Tier 1, pending Spline export)
│   └── dashboard/          # Recharts wrappers
└── routes/
    ├── Landing.tsx         # Landing page (Tier 1)
    ├── MapPage.tsx         # Network Map (Tier 1) ← START HERE
    ├── ProductSearch.tsx   # Product search (Tier 1)
    ├── OrderIntake.tsx     # Order intake (Tier 1)
    ├── Dashboard.tsx       # Admin dashboard (Tier 2)
    ├── ColdStorage.tsx     # Cold storage for farmers (Tier 2)
    ├── Tracking.tsx        # Live tracking (Tier 3 — stub)
    └── Vendors.tsx         # Vendor directory (Tier 3 — stub)
```

## Design System

All visual values are defined once in `src/styles/tokens.ts` and applied globally via the
CSS `@theme` block in `src/index.css`. **No page or component introduces its own color, font,
or spacing value.**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#F7F5F1` | Page surfaces (warm off-white) |
| `--color-ink` | `#1E2233` | Text, dark surfaces |
| `--color-accent` | `#C97A4A` | CTAs, active states, Spline glow |
| `--color-success` | `#3D9E6B` | In-stock, healthy |
| `--color-alert` | `#D94F3D` | Low-stock, delays |
| `--font-display` | Playfair Display | Headlines, section numerals |
| `--font-body` | Inter | Data, UI chrome |

## Mock vs Live Data

Each React Query hook has a `USE_MOCK` flag at the top of `src/api/hooks.ts`.
By default, `USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'` — so it reads mock data.

To switch to live backend, set in `.env.local`:
```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
```

### Current mock vs live status per page:

| Page | Mock | Live endpoint |
|------|------|---------------|
| Landing (stats) | ✅ Mock | `/dashboard/stats` |
| Landing (vendors/marquee) | ✅ Mock | `/vendors` |
| Network Map | ✅ Mock | `/warehouses` |
| Product Search | ✅ Mock | `/search?q=` |
| Order Intake | ✅ Mock | `POST /orders` |
| Dashboard | ✅ Mock | `/dashboard/*`, `/warehouses` |
| Cold Storage | ✅ Mock | `/warehouses?facility_type=COLD_STORAGE` |
| Live Tracking | Tier 3 — stub | `/deliveries` |
| Vendors | Tier 3 — stub | `/vendors` |

## Tier Status

- **Tier 1** (Landing, Map, Search, Order): ✅ Complete
- **Tier 2** (Dashboard, Cold Storage): ✅ Complete
- **Tier 3** (Tracking, Vendors): Stub pages — not started

## Spline 3D Hero

The landing page hero currently shows an animated placeholder (India network diagram).
To wire in the Spline export:

1. Export the Spline scene and upload to Spline CDN
2. In `src/routes/Landing.tsx`, replace `<HeroPlaceholder />` with:
   ```tsx
   import SplineHero from '../components/hero/SplineHero';
   // ...
   <SplineHero />
   ```
3. `SplineHero.tsx` (to be created in `src/components/hero/`) should:
   - Use `IntersectionObserver` to only mount when in viewport
   - Wrap in `<Suspense>` with fallback to `<HeroPlaceholder />`
   - Check for WebGL support before mounting Spline

The Spline scene colors should match:
- Background: `#F7F5F1` (--color-base)
- Node glow: `#C97A4A` (--color-accent)
- Node base: `#1E2233` (--color-ink)
