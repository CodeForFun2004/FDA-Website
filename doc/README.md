# FDA Web Admin

Frontend web app for Flood Detection & Alert (FDA) administration. This app provides an internal dashboard for monitoring flood stations, zones, alerts, and system operations.

## Overview

FDA Web is a Next.js App Router project with a feature-based architecture. It includes:

- Admin dashboard and operational views
- Flood zones map (MapLibre) with severity markers and overlays
- Station and area management
- Flood history and analytics
- Alerts, logs, and user management
- Role-based access control (RBAC) via middleware

## Tech Stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand state management
- TanStack Query / Table
- MapLibre GL for maps
- Sentry (optional)

## Main Areas

Routes live in `src/app`:

- `/admin` dashboard
  - zones map, stations, areas
  - alerts, logs, flood history, user alert subscriptions
  - users and settings
- `/auth` login/register/google callback
- `/authority` authority view

Feature modules live in `src/features` (e.g. `zones`, `stations`, `users`, `alerts`, `flood-history`).

Notes:

- OSM tiles are used by default; Mapbox token is only needed for satellite mode.
- Sentry variables are optional.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run production server
npm run lint       # lint
npm run format     # prettier
```

## Related Docs

- `README_RBAC.md` for RBAC flow and middleware setup
- `AUTHENTICATION_FIX.md` for auth changes and token refresh logic
