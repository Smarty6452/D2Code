# D2Code — Claude Agent Rules

## Project Overview

D2Code is a developer social discovery app ("Tinder for devs") where developers find nearby people to connect with based on shared tech stack, coding interests, and personality prompts. The optional "code date" feature lets matched devs schedule a meetup to pair-program or collaborate.

**Monorepo structure:**
- `apps/web` — Next.js 15 (App Router) frontend
- `apps/api` — Hono REST API backend
- `packages/shared` — Zod schemas + TypeScript types shared across apps

**GitHub:** https://github.com/Smarty6452/D2Code.git

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15, Tailwind CSS v4, shadcn/ui, TanStack Query v5, next-auth v5 |
| Backend | Hono, Drizzle ORM, PostgreSQL (Supabase), `@hono/node-server` |
| Shared | Zod schemas, TypeScript interfaces |
| Real-time | Supabase Realtime (Phase 2) |
| Deploy | Vercel (web) + Railway (api) |

---

## Agents

| Agent | Scope | When to Use |
|---|---|---|
| `planner` | Feature design, task breakdown, roadmap updates | Designing new features, breaking work into tasks |
| `frontend` | `apps/web` — pages, components, hooks, API calls | UI work, Next.js pages, React components |
| `backend` | `apps/api` — routes, services, DB schema/migrations | API endpoints, business logic, DB changes |
| `fullstack` | Cross-app features (auth, onboarding, shared types) | Features touching both apps |
| `qa` | Tests, edge case review, security audit | Writing tests, reviewing for bugs |

---

## Hard Rules (Never Break These)

- **NEVER edit `schema.ts` without also writing a Drizzle migration** (`pnpm db:generate`)
- **NEVER expose raw user lat/lng** — always round to 2 decimal places before storing (~1 km precision)
- **NEVER leave API routes unprotected** — every route except `/auth/login` and `/auth/signup` must go through `authMiddleware`
- **NEVER use `any` types** — TypeScript strict mode is on
- **NEVER call the DB directly from Next.js server components** — always go through the API layer
- **NEVER hardcode secrets** — use `.env.local` / Railway env vars

---

## Conventions

### TypeScript
- All request bodies validated with Zod schemas from `@d2code/shared` before any DB operation
- Use TanStack Query for all async server state in the frontend — no `useState` for data fetching
- No class components; functional components only
- Use `exactOptionalPropertyTypes` — don't pass `undefined` where a property isn't optional

### File Naming
- Components: `PascalCase` (e.g., `ProfileCard.tsx`)
- Files/routes: `kebab-case` (e.g., `api-client.ts`, `auth.ts`)
- DB tables: `snake_case`
- TypeScript types/interfaces: `PascalCase`

### Component Organization
- `components/ui/` — base primitives (shadcn/ui) — **do not hand-write base UI elements**
- `components/<feature>/` — feature-specific components (e.g., `discover/swipe-stack.tsx`)
- `hooks/` — custom React hooks (e.g., `use-geolocation.ts`)
- `lib/` — utilities and clients (e.g., `api-client.ts`, `auth.ts`)

### API Design
- REST only — no GraphQL
- Routes: `GET /resource`, `POST /resource`, `PATCH /resource/:id`, `DELETE /resource/:id`
- All responses: JSON
- Errors: `{ message: string }` with appropriate HTTP status codes
- Auth: `Authorization: Bearer <token>` header

---

## Git Conventions

### Branch Names
```
feat/<description>   e.g. feat/swipe-mechanic
fix/<description>    e.g. fix/match-race-condition
chore/<description>  e.g. chore/setup-ci
refactor/<name>      e.g. refactor/auth-middleware
```

### Commit Messages (Conventional Commits)
```
feat(discover): add geo-filtered profile query
fix(chat): resolve message duplication on reconnect
chore(ci): add typecheck step to PR workflow
refactor(auth): extract token refresh into middleware
```

### PR Flow
1. Branch off `dev`
2. Open PR to `dev` — CI must pass (lint, typecheck)
3. Squash merge to `dev`
4. `dev → main` release merge (tagged)

---

## Development Commands

```bash
# Install all dependencies
pnpm install

# Run everything in dev mode
pnpm dev

# Run just the web app
pnpm --filter @d2code/web dev

# Run just the API
pnpm --filter @d2code/api dev

# Typecheck everything
pnpm typecheck

# DB: generate migration after schema change
pnpm --filter @d2code/api db:generate

# DB: push schema to dev database
pnpm --filter @d2code/api db:push
```

---

## Environment Setup

1. Copy `.env.example` to `.env.local` in `apps/web` and `apps/api`
2. Create a Supabase project → get `DATABASE_URL`
3. Create a GitHub OAuth App → get `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
4. Generate a `JWT_SECRET` (use `openssl rand -hex 32`)
5. Generate a `NEXTAUTH_SECRET` (use `openssl rand -hex 32`)
6. Run `pnpm --filter @d2code/api db:push` to initialize schema

---

## Current MVP Phase

**Phase 0 — Setup** ✅
**Phase 1 — Auth & Profiles** → next
**Phase 2 — Discovery Feed**
**Phase 3 — Matches & Chat**
**Phase 4 — Polish & Deploy**

See full roadmap in `PLAN.md` or the plan file at `.claude/plans/`.
