# AGENTS.md — PSC Repository

## Overview

Two independent applications in one repo (no workspace manager):

- `psc-backend/` — NestJS 11 API, Prisma + MySQL, cookie-based auth
- `admin-portal/` — Vite + React 18 + shadcn/ui admin dashboard

## Repository Layout

```
psc/
├── psc-backend/          # NestJS backend (port 3000)
│   ├── prisma/
│   │   └── schema.prisma # Single source of truth for DB schema
│   ├── src/
│   │   ├── main.ts       # Entry point (CORS, /api prefix, ValidationPipe)
│   │   └── app.module.ts # Top-level module imports
│   ├── .env              # ⚠️ Committed secrets; required for local dev
│   └── Dockerfile        # Multi-stage; runs prisma migrate deploy on start
├── admin-portal/         # React admin portal (port 5173)
│   ├── config/apis.ts    # All API calls; hardcoded to http://localhost:3000/api
│   ├── src/App.tsx       # Route definitions + permission guards
│   └── Dockerfile        # Static build served with `serve`
└── docker-compose.yml    # Orchestrates both services
```

## Commands

**Backend (`psc-backend/`)**

```bash
npm install
npx prisma generate        # Required after install or schema changes
npm run start:dev           # Dev server with watch
npm run build               # Nest build → dist/
npm run start:prod          # node dist/main
npm run test                # Jest unit tests
npm run test:e2e            # E2E tests (jest --config ./test/jest-e2e.json)
npx prisma migrate dev      # Create/apply migrations locally
npx prisma migrate deploy   # Apply migrations in production/Docker
```

**Frontend (`admin-portal/`)**

```bash
npm install
npm run dev                 # Vite dev server (port 5173)
npm run build               # Production build → dist/
npm run lint                # ESLint
```

## Important Conventions

- **No root package.json.** Always `cd` into the correct app before running commands.
- **Frontend API calls are centralized** in `admin-portal/config/apis.ts`. Every call uses `withCredentials: true` and sends `Client-Type: web` header. Backend auth is cookie-based for the web portal.
- **Backend `.env` is tracked in git.** It is required for local development. Do not overwrite it unless asked.
- **Prisma client must be regenerated** after any `npm install` or schema change in the backend: `npx prisma generate`.
- **Docker backend auto-migrates.** The container entrypoint runs `npx prisma migrate deploy` before starting the app.
- **TypeScript strictness is intentionally loose.** Both projects disable `noImplicitAny` and/or `strict`. Do not tighten these settings.
- **Static bills directory.** Backend serves files from `data/bills` at `/bills/` prefix. This path is volume-mounted in Docker.

## Testing

- Backend tests use Jest. Config is inline in `package.json` + `test/jest-e2e.json`.
- Frontend has no test suite configured.

## Deployment / Docker

- `docker-compose.yml` at repo root spins up both services.
- Backend container depends on a root-level `.env` file.
- Backend exposes 3000; admin portal exposes 5173.

## Gotchas

- The frontend hardcodes `base_url = "http://localhost:3000/api"`. If testing against a deployed backend, change this in `admin-portal/config/apis.ts`.
- CORS in `main.ts` whitelists specific origins (`localhost:5173`, `admin.peshawarservicesclub.com`, etc.). If the frontend is served from a new domain, add it to the `allowed` array.
- Permission guards in `admin-portal/src/App.tsx` rely on `/auth/user-who` returning `role` and `permissions`. `SUPER_ADMIN` bypasses all checks.
