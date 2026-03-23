import { Hono } from 'hono'
import { db } from '../db/client'
import { profiles, profileSkills, profilePrompts, swipes, blocks } from '../db/schema'
import { eq, ne, and, notInArray, sql } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

app.use('*', authMiddleware)

// GET /discover
// Returns scored, geo-filtered profiles excluding already-swiped and blocked
app.get('/', async (c) => {
  const userId = c.get('userId') as string

  // Get current user's profile
  const myProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { profileSkills: { with: { skill: true } } },
  })

  if (!myProfile) {
    return c.json({ message: 'Complete your profile first' }, 400)
  }

  const radiusKm = myProfile.radiusKm ?? 25

  // IDs to exclude: already swiped
  const swipedRows = await db
    .select({ swipedId: swipes.swipedId })
    .from(swipes)
    .where(eq(swipes.swiperId, userId))

  const blockedRows = await db
    .select({ blockedId: blocks.blockedId })
    .from(blocks)
    .where(eq(blocks.blockerId, userId))

  const excludeIds = [
    userId,
    ...swipedRows.map((r) => r.swipedId),
    ...blockedRows.map((r) => r.blockedId),
  ]

  // Bounding-box geo filter (rough, fast; ~1 deg lat ≈ 111 km)
  const latDelta = radiusKm / 111
  const lngDelta =
    myProfile.locationLat !== null
      ? radiusKm / (111 * Math.cos((parseFloat(String(myProfile.locationLat)) * Math.PI) / 180))
      : latDelta

  const candidates = await db.query.profiles.findMany({
    where: and(
      ne(profiles.userId, userId),
      eq(profiles.visibility, true),
      myProfile.locationLat !== null && myProfile.locationLng !== null
        ? sql`${profiles.locationLat} BETWEEN ${parseFloat(String(myProfile.locationLat)) - latDelta} AND ${parseFloat(String(myProfile.locationLat)) + latDelta}
            AND ${profiles.locationLng} BETWEEN ${parseFloat(String(myProfile.locationLng)) - lngDelta} AND ${parseFloat(String(myProfile.locationLng)) + lngDelta}`
        : undefined,
      excludeIds.length > 0 ? notInArray(profiles.userId, excludeIds) : undefined
    ),
    with: {
      profileSkills: { with: { skill: true } },
      profilePrompts: { with: { prompt: true } },
    },
    limit: 50,
  })

  // Score candidates
  const mySkillIds = new Set(myProfile.profileSkills.map((ps) => ps.skillId))

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const scored = candidates
    .map((p) => {
      let score = 0

      // Shared skills: +2 per overlap
      for (const ps of p.profileSkills) {
        if (mySkillIds.has(ps.skillId)) score += 2
      }

      // Recency boost
      if (p.updatedAt > sevenDaysAgo) score += 1

      // Distance (km) for display
      let distanceKm: number | null = null
      if (
        myProfile.locationLat !== null &&
        myProfile.locationLng !== null &&
        p.locationLat !== null &&
        p.locationLng !== null
      ) {
        const dLat =
          (parseFloat(String(p.locationLat)) - parseFloat(String(myProfile.locationLat))) *
          (Math.PI / 180)
        const dLng =
          (parseFloat(String(p.locationLng)) - parseFloat(String(myProfile.locationLng))) *
          (Math.PI / 180)
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((parseFloat(String(myProfile.locationLat)) * Math.PI) / 180) *
            Math.cos((parseFloat(String(p.locationLat)) * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2
        distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
      }

      return { profile: p, score, distanceKm }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)

  // Slight shuffle within top 20 to avoid fully deterministic feed
  for (let i = scored.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[scored[i], scored[j]] = [scored[j]!, scored[i]!]
  }

  const result = scored.map(({ profile: p, distanceKm }) => ({
    id: p.userId,
    name: p.name,
    bio: p.bio,
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    city: p.city,
    distanceKm,
    skills: p.profileSkills.map((ps) => ({
      skillId: ps.skillId,
      name: ps.skill.name,
      level: ps.level,
    })),
    prompts: p.profilePrompts.map((pp) => ({
      promptId: pp.promptId,
      question: pp.prompt.questionText,
      answer: pp.answer,
    })),
  }))

  return c.json(result)
})

export { app as discoverRoutes }
