# D2Code — Full Project Documentation

> **Developer social discovery app** — "Tinder for devs"
> Connect with nearby developers based on shared tech stack, interests, and personality. Schedule code dates to build together.

**GitHub:** https://github.com/Smarty6452/D2Code.git
**Last Updated:** 2026-03-23
**Stack:** Next.js 15 · Hono · Drizzle ORM · PostgreSQL (Supabase) · TanStack Query · next-auth v5

---

## Table of Contents

1. [Project Vision & Unique Value](#1-project-vision--unique-value)
2. [Core Features (MVP)](#2-core-features-mvp)
3. [Unique Differentiators](#3-unique-differentiators)
4. [What Is Implemented](#4-what-is-implemented)
5. [What Remains](#5-what-remains)
6. [Current Architecture State](#6-current-architecture-state)
7. [Phase Roadmap](#7-phase-roadmap)
8. [Sub-Agent Workflow](#8-sub-agent-workflow)
9. [Real-time Swipe & Navigation Design](#9-real-time-swipe--navigation-design)
10. [Design System](#10-design-system)
11. [Setup & Running Locally](#11-setup--running-locally)

---

## 1. Project Vision & Unique Value

Most networking apps are generic. D2Code is **built for developers, by developers**:

- Match on **actual skills** — TypeScript, Rust, PostgreSQL — not just job titles
- **Icebreaker prompts** designed for devs: "My spirit animal framework is…", "I debug with…"
- **Code date** feature: propose a pair-programming session right from the chat
- **Privacy-first location**: coordinates rounded to ~1 km, never stored with full precision
- **GitHub-connected profiles**: showcase real work, not buzzwords

---

## 2. Core Features (MVP)

| Feature | Description | Status |
|---|---|---|
| Auth | Email/password + GitHub OAuth | ✅ Done |
| Profile | Bio, avatar, skills (tagged + leveled), icebreaker prompts, GitHub link | ✅ Done |
| Onboarding | 3-step flow: bio → skills → prompts with geolocation capture | ✅ Done |
| Discovery | Geo-filtered, skill-scored card feed | ✅ Done |
| Swipe | Drag-to-swipe cards with snap-back, fly animation, Like/Nope overlays | ✅ Done |
| Match | Mutual like detection, match modal, match list | ✅ Done |
| Chat | Per-match text messaging with polling | ✅ Done |
| Settings | Radius, visibility, sign out | ✅ Done |
| Avatar Upload | Supabase Storage with preview & validation | ✅ Done |
| Navigation | Fixed top nav (desktop) + bottom tab bar (mobile) | ✅ Done |

---

## 3. Unique Differentiators

### What Makes D2Code Different

**1. Skill-based matching, not just location**
The discovery algorithm scores candidates by shared skills (+2 pts each), so a Rust developer always sees other Rust devs in their feed before generic "software engineers".

**2. Dev-specific icebreakers**
Prompts like "My unpopular tech opinion:" or "The first thing I do in a new codebase:" create instant common ground. Far more useful than "describe yourself in three words".

**3. Code Date**
The only dating/networking app where "let's hang out" means "let's pair on something". Propose a session with a time, location or virtual link, directly from the chat.

**4. Tech stack as identity**
Skills are first-class data — not a search filter but a core matching dimension. Each skill can carry a level (beginner/mid/senior) giving nuanced signals.

**5. Privacy-first location**
We round coordinates to 2 decimal places (~1 km grid). Users see "3 km away" — never exact addresses. Radius control is built into settings, not buried.

**6. GitHub as social proof**
Link your GitHub and future AI-powered versions can auto-import languages, star count, and recent commits as real match signals — not self-reported.

---

## 4. What Is Implemented

### Phase 0 — Infrastructure ✅
- pnpm + Turborepo monorepo (`apps/web`, `apps/api`, `packages/shared`)
- Next.js 15 App Router + Tailwind CSS v4 + shadcn/ui primitives
- Hono REST API + Drizzle ORM
- Full PostgreSQL schema (12 tables with enums, indexes, unique constraints)
- GitHub Actions CI (lint + typecheck on PR)
- Deploy workflows for Vercel + Railway
- `CLAUDE.md` with agent rules and coding constraints

### Phase 1 — Auth & Profiles ✅

#### Authentication
- [x] Email/password signup with bcrypt (12 rounds)
- [x] Email/password login → JWT (7 day expiry)
- [x] GitHub OAuth via next-auth v5
- [x] Protected routes via Next.js edge middleware
- [x] Password visibility toggle
- [x] Error states with animated banners

#### Profiles
- [x] Profile auto-created on user signup
- [x] `GET /profiles/me` with skills + prompts relations
- [x] `PATCH /profiles/me` — bio, city, GitHub URL, skills, prompts, location, radius, visibility
- [x] Skills: find-or-create pattern, multi-select with level tagging
- [x] Icebreaker prompts: linked to profile answers

#### Avatar Upload
- [x] `POST /uploads/avatar` — multipart form, 5 MB limit, JPEG/PNG/WebP
- [x] Uploads to Supabase Storage (`avatars` bucket)
- [x] Public URL written back to profile
- [x] Client-side preview before upload
- [x] Click-to-replace UI with hover overlay

#### Onboarding
- [x] 3-step guided flow: bio/city → skills → prompts
- [x] Geolocation API with privacy rounding
- [x] Step validation (min 1 skill required)
- [x] `onboardingComplete` flag on profile

#### Settings
- [x] Discovery radius: 5 / 10 / 25 / 50 / 100 / 250 km presets
- [x] Visibility toggle (show/hide from feed)
- [x] Sign out → redirect to landing

### Discovery & Swipe ✅

#### Backend Discovery Algorithm
```
1. Load current user's profile + skill IDs
2. Bounding-box geo-filter (lat/lng delta based on radiusKm)
3. Exclude: own profile + already-swiped + blocked users
4. Score up to 50 candidates:
   + 2 pts per shared skill
   + 1 pt if updated in last 7 days (active user bonus)
5. Sort DESC by score, take top 20
6. Apply Fisher-Yates shuffle (prevent fully deterministic feed)
7. Compute Haversine distance for each result
8. Return: id, name, bio, avatar, city, distanceKm, skills[], prompts[]
```

#### Swipe System
- [x] `POST /swipes` — records like/pass
- [x] Mutual like detection (check reverse swipe in DB)
- [x] Match created with consistent UUID ordering (`MIN(a,b)` / `MAX(a,b)`)
- [x] Idempotent via `onConflictDoNothing`
- [x] Returns `{ matched: boolean }`

#### Swipe UI — `SwipeCard` Component
- [x] Pointer events (touch + mouse) with capture
- [x] Live transform: `translate(dx, dy*0.4) rotate(dx * 0.08deg)`
- [x] 3-card visible stack (scale + Y offset per depth)
- [x] **Like/Nope overlay labels** — opacity tied to drag distance `[0, THRESHOLD]`
- [x] Fly animation on commit: `cubic-bezier(0.25, 1, 0.5, 1)` 320ms
- [x] Snap-back on release < 100px threshold
- [x] Button fallback (X / ❤️) for accessibility
- [x] Directional color overlay on fly (green=like, red=pass)
- [x] Progress hint: "3 seen · 17 remaining"
- [x] Loading skeleton (shimmer cards)

#### Match Modal
- [x] Displayed on mutual like
- [x] Options: Keep swiping / Message
- [x] Animated `scale-in` entrance

### Matches & Chat ✅

#### Match List
- [x] Lists active matches with avatar, name, last message preview
- [x] Shimmer skeleton loading (4 rows)
- [x] Online indicator dot (visual placeholder)
- [x] Empty state → CTA to discover
- [x] Stagger animation on list items

#### Chat Thread
- [x] `GET /chat/:matchId/messages` (100 msg limit, sorted asc)
- [x] `POST /chat/:matchId/messages` (Zod validated, auth-checked)
- [x] Sender/receiver bubble differentiation (violet vs glass)
- [x] Auto-scroll to bottom on new messages
- [x] Polling every 3s (pending WebSocket upgrade)
- [x] Input focuses after send
- [x] Animated message entry with stagger
- [x] Back arrow on mobile

### Navigation ✅
- [x] Desktop: fixed frosted-glass top nav with logo
- [x] Mobile: fixed bottom tab bar (5 items)
- [x] Active route: violet glow highlight
- [x] Routes: Discover · Matches · Chat · Profile · Settings

---

## 5. What Remains

### Phase 2 — Real-time & Code Dates 🔲

#### P0 — Must Have
| Feature | Effort | Notes |
|---|---|---|
| Supabase Realtime chat | M | Replace 3s polling with WebSocket channels |
| Typing indicators | S | Supabase presence channels |
| Code Date proposals | M | UI in chat + `POST /code-dates` route |
| Code Date responses | S | Accept/Decline with `PATCH /code-dates/:id` |
| Block user | S | `POST /blocks` + remove from discover feed |
| Report user | S | `POST /reports` → stored for moderation |
| Onboarding guard | S | Redirect non-onboarded users to `/onboarding` |

#### P1 — Should Have
| Feature | Effort | Notes |
|---|---|---|
| Read receipts | S | Update `readAt` on message fetch |
| Match notification badge | S | Unread count on Matches nav item |
| GitHub auto-import | M | Call GitHub API on OAuth login, populate skills |
| Password reset | M | Email OTP via Supabase Auth |
| Email verification | M | Required for production |

### Phase 3 — Polish & Scale 🔲

| Feature | Effort | Notes |
|---|---|---|
| AI match scoring | L | Embed skill + prompt text, cosine similarity |
| Push notifications | M | PWA manifest + service worker |
| Profile completion meter | S | Progress bar nudging users to fill profile |
| Seed data + demo mode | S | Fake profiles for testing |
| Admin dashboard | L | Moderation review queue |
| Analytics | M | Swipe rate, match rate, DAU |
| Public profile page | M | Shareable `/u/:username` link |

### Phase 4 — Team & Events 🔲
- Team formation (1→many matching for project squads)
- Hackathon/meetup events board
- Video/audio call within matched chat

---

## 6. Current Architecture State

```
d2code/
├── apps/
│   ├── web/                          ← Next.js 15 App Router
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/           ← login, signup (public)
│   │       │   ├── (app)/            ← protected routes
│   │       │   │   ├── discover/     ✅ SwipeStack
│   │       │   │   ├── matches/      ✅ MatchList
│   │       │   │   ├── chat/         ✅ ChatThread + index
│   │       │   │   ├── profile/      ✅ ProfileEditor
│   │       │   │   ├── settings/     ✅ SettingsPanel
│   │       │   │   └── onboarding/   ✅ OnboardingFlow
│   │       │   └── page.tsx          ✅ Landing page
│   │       ├── components/
│   │       │   ├── ui/               ✅ Button, Input, Badge
│   │       │   ├── auth/             ✅ LoginForm, SignupForm
│   │       │   ├── discover/         ✅ SwipeStack (drag+button)
│   │       │   ├── matches/          ✅ MatchList (skeletons)
│   │       │   ├── chat/             ✅ ChatThread (polling)
│   │       │   ├── profile/          ✅ ProfileCard, Editor, AvatarUpload, SkillTag
│   │       │   ├── onboarding/       ✅ OnboardingFlow (3 steps)
│   │       │   └── settings/         ✅ SettingsPanel
│   │       ├── hooks/                ✅ useGeolocation
│   │       ├── lib/                  ✅ apiClient, auth, utils
│   │       └── middleware.ts         ✅ Edge auth guard
│   │
│   └── api/                          ← Hono REST API
│       └── src/
│           ├── routes/
│           │   ├── auth.ts           ✅ signup, login
│           │   ├── profiles.ts       ✅ GET/PATCH me
│           │   ├── discover.ts       ✅ geo+score algorithm
│           │   ├── swipes.ts         ✅ like/pass + match detect
│           │   ├── matches.ts        ✅ list + unmatch
│           │   ├── chat.ts           ✅ messages CRUD
│           │   └── uploads.ts        ✅ avatar → Supabase
│           ├── db/
│           │   ├── schema.ts         ✅ 12 tables, enums, indexes
│           │   └── client.ts         ✅ Drizzle + pg Pool
│           ├── middleware/
│           │   └── auth.ts           ✅ JWT verify
│           └── lib/
│               └── supabase.ts       ✅ Storage client
│
└── packages/
    └── shared/                       ← Shared types + Zod
        └── src/
            ├── schemas/              ✅ auth, profile, swipe, chat
            └── types/                ✅ Profile, Match, Message, DiscoverProfile
```

### API Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login → JWT |
| GET | `/profiles/me` | Yes | Get own profile + skills + prompts |
| PATCH | `/profiles/me` | Yes | Update profile |
| POST | `/uploads/avatar` | Yes | Upload avatar to Supabase |
| GET | `/discover` | Yes | Geo-filtered scored feed |
| POST | `/swipes` | Yes | Record like/pass → detect match |
| GET | `/matches` | Yes | List active matches |
| DELETE | `/matches/:id` | Yes | Unmatch |
| GET | `/chat/:matchId/messages` | Yes | Get messages |
| POST | `/chat/:matchId/messages` | Yes | Send message |

### Database Schema

```
users              → id, email, password_hash, github_id
profiles           → id, user_id, name, bio, avatar_url, github_url,
                     location_lat, location_lng, city, radius_km,
                     visibility, onboarding_complete
skills             → id, name, category
profile_skills     → profile_id, skill_id, level
prompts            → id, question_text
profile_prompts    → profile_id, prompt_id, answer
swipes             → id, swiper_id, swiped_id, direction
matches            → id, user_a_id, user_b_id, status
messages           → id, match_id, sender_id, content, sent_at, read_at
code_dates         → id, match_id, proposed_by, datetime, location, status
blocks             → id, blocker_id, blocked_id
reports            → id, reporter_id, reported_id, reason
```

---

## 7. Phase Roadmap

```
Phase 0 ✅  Monorepo setup, schema, CI/CD, CLAUDE.md
Phase 1 ✅  Auth, profiles, avatar upload, settings, onboarding
Phase 2 🔲  Real-time chat (Supabase Realtime), code dates, block/report
Phase 3 🔲  GitHub import, AI scoring, push notifications, PWA
Phase 4 🔲  Teams, events board, video calls, public profiles
```

### Phase 2 Detailed Plan

#### 2a — Real-time Chat (Supabase Realtime)
Replace 3s polling with live WebSocket channels.

**Backend changes:**
- No server changes needed — Supabase Realtime listens to `messages` table directly
- Enable Realtime on `messages` table in Supabase dashboard

**Frontend changes — `chat-thread.tsx`:**
```
Replace: refetchInterval: 3000
With:    useEffect → supabase.channel('chat:matchId')
                       .on('INSERT', messages, append to list)
                       .subscribe()
```

**New files:**
- `lib/supabase-client.ts` — browser Supabase client (anon key)
- `hooks/use-realtime-chat.ts` — channel hook

#### 2b — Code Date UI
Add "Propose a code date" button inside chat thread.

**New API routes:**
- `POST /code-dates` — { matchId, datetime, locationText?, virtualLink? }
- `PATCH /code-dates/:id` — { status: 'accepted' | 'declined' }

**New components:**
- `components/chat/code-date-proposal.tsx` — card shown in chat when a date is proposed
- `components/chat/code-date-button.tsx` — floating button in chat input bar

#### 2c — Block & Report
Wire block/report to the discovery algorithm.

**New API routes:**
- `POST /blocks` — block a user (removes from feed, hides match)
- `POST /reports` — file a report

**UI:**
- Long-press on profile card → context menu: Block / Report
- Confirmation modal

---

## 8. Sub-Agent Workflow

D2Code uses Claude's multi-agent system via `CLAUDE.md`. Each agent has a defined scope:

### Agent Roles

| Agent | Scope | When to Invoke |
|---|---|---|
| `planner` | Feature design, task breakdown | Starting a new phase or feature |
| `frontend` | `apps/web` — pages, components, hooks | UI work, new pages, component updates |
| `backend` | `apps/api` — routes, services, schema | API endpoints, DB changes |
| `fullstack` | Cross-cutting features (auth, onboarding) | Features touching both apps |
| `qa` | Tests, edge cases, security audit | Before marking a phase complete |

### Recommended Agent Invocations for Phase 2

```markdown
<!-- Realtime chat -->
@frontend: Replace polling in chat-thread.tsx with Supabase Realtime subscription.
           Hook file: hooks/use-realtime-chat.ts
           Supabase client: lib/supabase-client.ts (anon key, browser only)

<!-- Code dates -->
@backend: Add POST /code-dates and PATCH /code-dates/:id routes.
          Schema table `code_dates` already exists in schema.ts.
          Validate with new Zod schema in packages/shared/src/schemas/code-date.ts

@frontend: Add code date proposal UI inside ChatThread.
           New component: components/chat/code-date-proposal.tsx
           Show as a special card type in the message list.

<!-- Block/Report -->
@fullstack: Wire block system:
            Backend: POST /blocks — insert to blocks table
            Frontend: long-press menu on SwipeCard → confirm modal → POST /blocks
            Discovery: /discover already reads blocks table for exclusions ✅

<!-- QA -->
@qa: Review auth flow for OWASP top 10.
     Check: no raw SQL, all inputs Zod-validated, JWT expiry, CORS origin lock.
     Test: mutual match race condition (two simultaneous likes).
```

### How CLAUDE.md Governs Agents

The `CLAUDE.md` file acts as the **shared constitution** for all agents:
- Hard rules (never bypass auth, never store raw lat/lng)
- File conventions (PascalCase components, snake_case DB)
- Which tools each agent may use
- Commit style enforcement
- Stack constraints (no GraphQL, no class components)

This prevents agents from drifting — even if different agents work on different phases, the output is coherent.

---

## 9. Real-time Swipe & Navigation Design

### Swipe Interaction Details

```
User drags card →
  onPointerDown   → capture pointer, record startX/Y
  onPointerMove   → compute dx/dy, update transform:
                    translate(dx, dy*0.4) rotate(dx * 0.08deg)
                    show Like label  if dx > 0 (opacity = dx/100)
                    show Nope label  if dx < 0 (opacity = -dx/100)
  onPointerUp     →
    if |dx| >= 100px → COMMIT SWIPE
      set fly transform (+600px or -600px, rotate ±30)
      wait 320ms → call onSwipe(direction)
    else → SNAP BACK
      spring back to center (cubic-bezier 0.34 1.56 0.64 1)
```

**Stack Depth Effect:**
```
Card 0 (top):   scale(1),    translateY(0)   z-index: 10
Card 1 (back):  scale(0.96), translateY(10)  z-index: 9
Card 2 (back):  scale(0.92), translateY(20)  z-index: 8
```

**Performance notes:**
- `willChange: 'transform'` on every card
- Pointer capture prevents drag losing focus on fast moves
- `onPointerCancel` handles interrupted gestures (phone call, etc.)

### Navigation Flow

```
/ (landing)
  ↓ signup / login
/(auth)/login
/(auth)/signup
  ↓ authenticated
/(app)/onboarding     ← first-time users only
/(app)/discover       ← main feed (default after login)
  ↓ swipe right on both users
[MATCH MODAL] → /chat/[matchId]  or  keep swiping
/(app)/matches        ← list of all active matches
/(app)/chat           ← same as matches (conversation list)
/(app)/chat/[matchId] ← individual conversation thread
/(app)/profile        ← edit own profile
/(app)/settings       ← radius, visibility, sign out
```

---

## 10. Design System

### Color Tokens (CSS variables)
```css
--background:   220 16% 5%    /* #080b11 — near-black blue */
--foreground:   0 0% 95%      /* #f2f2f2 — off-white */
--primary:      258 85% 65%   /* #7b69f0 — violet brand */
--card:         220 14% 8%    /* #0e1118 — surface */
--muted:        220 12% 12%   /* #171c26 — subtle bg */
--border:       220 14% 14%   /* very subtle border */
--destructive:  0 72% 55%     /* red */
```

### Key Utility Classes
| Class | Effect |
|---|---|
| `.glass` | Frosted glass panel (blur 20px, border white/6%) |
| `.glass-card` | Solid dark surface card |
| `.gradient-text` | Violet→indigo→cyan text gradient |
| `.glow-primary` | Violet box-shadow glow |
| `.skeleton` | Shimmer loading placeholder |
| `.animate-fade-up` | Slide up from 20px + fade in |
| `.animate-scale-in` | Scale from 0.92 + fade in |
| `.animate-orb-pulse` | Scale + opacity pulse for background orbs |

### Component Patterns
- All inputs: `rounded-2xl border border-white/[0.08] bg-white/[0.04]` with violet focus ring
- All primary buttons: `bg-violet-600 glow-primary rounded-2xl hover:bg-violet-500`
- Skill tags: colored by level (emerald=beginner, indigo=mid, violet=senior)
- Cards: `glass-card rounded-2xl` or `glass rounded-3xl` for overlay panels

---

## 11. Setup & Running Locally

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project (free tier)
- GitHub OAuth App

### Steps

```bash
# 1. Clone & install
git clone https://github.com/Smarty6452/D2Code.git
cd D2Code
pnpm install

# 2. Configure apps/api/.env.local
DATABASE_URL=postgresql://...
JWT_SECRET=$(openssl rand -hex 32)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
WEB_URL=http://localhost:3000

# 3. Configure apps/web/.env.local
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001

# 4. Push DB schema
pnpm --filter @d2code/api db:push

# 5. Create Supabase Storage bucket
# Go to Supabase dashboard → Storage → New bucket → "avatars" → Public

# 6. Run everything
pnpm dev
# Web: http://localhost:3000
# API: http://localhost:3001
```

### Useful Commands
```bash
pnpm typecheck                    # Check all TypeScript
pnpm lint                         # Lint all packages
pnpm --filter @d2code/api db:generate   # Generate migration after schema change
pnpm --filter @d2code/api db:studio     # Open Drizzle Studio (DB browser)
```

---

*Built with Claude Code multi-agent workflow — planner, frontend, backend, and QA agents collaborating under CLAUDE.md rules.*
