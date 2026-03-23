# LinkedIn Post — D2Code × Claude Multi-Agent

---

🚀 **Building D2Code with Claude's multi-agent system — and CLAUDE.md is the most underrated file in my entire repo.**

I've been building D2Code — a developer social discovery app (think Tinder, but for finding devs who share your tech stack and want to collaborate). In 2 days I have a full-stack MVP: authentication, geo-filtered swipe feed, real-time matching, chat, avatar uploads, and a premium dark UI.

But the most interesting part isn't the app. It's *how* I built it.

---

**The setup: Claude Code + multi-agent workflow**

Instead of one AI session doing everything, I structured the work with **specialized agents**:

- `planner` — designs features, breaks down tasks
- `frontend` — owns Next.js, Tailwind, components
- `backend` — owns Hono API, Drizzle ORM, PostgreSQL schema
- `fullstack` — cross-cutting concerns like auth
- `qa` — reviews for edge cases and security

Each agent operates inside `CLAUDE.md` — a single file that acts as the **shared constitution** for all of them.

---

**Why CLAUDE.md is everything**

Without it, agents drift. One writes raw SQL, another bypasses auth, another stores precise GPS coordinates (a privacy violation). CLAUDE.md prevents all of that:

```markdown
# Hard Rules
- NEVER edit schema.ts without writing a migration
- NEVER store raw lat/lng — round to 2 decimal places (~1 km precision)
- NEVER leave API routes unprotected — all routes through authMiddleware
- NEVER use `any` types — TypeScript strict mode
- ALWAYS validate with Zod before touching the DB
```

It also defines commit conventions, file naming, component patterns, branch strategy, and which tools each agent is allowed to use. It's like a senior engineer's code review — baked into the workflow from the start.

---

**What this unlocks in 2026**

Coding with AI agents isn't about generating code faster. It's about **maintaining coherence at scale**:

✅ Every agent knows the architecture
✅ No agent breaks the rules of another's work
✅ You get junior-speed output with senior-level constraints
✅ The codebase stays clean even as features multiply fast

The shift isn't "AI writes code." It's "AI operates inside a system you design."

The engineer's job in 2026 is to design great systems — the architecture, the constraints, the agent boundaries. Then let the agents execute inside those guardrails.

---

**D2Code tech stack** (built in ~48 hours):
- Next.js 15 (App Router) + Tailwind CSS v4 + TanStack Query
- Hono API + Drizzle ORM + PostgreSQL (Supabase)
- next-auth v5 (GitHub OAuth + credentials)
- pnpm + Turborepo monorepo
- Full DB schema: 12 tables, Haversine geo-scoring, real-time match detection

What I'm building next: Supabase Realtime chat, Code Date proposals (pair-programming scheduler), and GitHub skill auto-import.

---

If you're building with AI agents and haven't written a `CLAUDE.md` yet — start there. It's the difference between a team that ships and a team that argues.

**#ClaudeCode #AIEngineering #BuildInPublic #NextJS #WebDev #DeveloperTools #2026**

---
> 💡 *Tip for the post: Add a short screen recording or screenshot of the swipe UI and the CLAUDE.md file side-by-side. Visual contrast between "the rules" and "the result" performs extremely well on LinkedIn.*
