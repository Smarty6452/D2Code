import { Hono } from 'hono'
import { db } from '../db/client'
import { matches, profiles, messages } from '../db/schema'
import { and, or, eq, desc } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

app.use('*', authMiddleware)

// GET /matches — list all active matches with other profile + last message
app.get('/', async (c) => {
  const userId = c.get('userId') as string

  const userMatches = await db
    .select()
    .from(matches)
    .where(
      and(
        or(eq(matches.userAId, userId), eq(matches.userBId, userId)),
        eq(matches.status, 'active')
      )
    )
    .orderBy(desc(matches.createdAt))

  const enriched = await Promise.all(
    userMatches.map(async (match) => {
      const otherUserId = match.userAId === userId ? match.userBId : match.userAId

      const otherProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, otherUserId),
      })

      const [lastMsg] = await db
        .select({ content: messages.content })
        .from(messages)
        .where(eq(messages.matchId, match.id))
        .orderBy(desc(messages.sentAt))
        .limit(1)

      return {
        id: match.id,
        createdAt: match.createdAt,
        otherProfile: {
          id: otherProfile?.userId,
          name: otherProfile?.name ?? 'Unknown',
          avatarUrl: otherProfile?.avatarUrl,
        },
        lastMessage: lastMsg?.content ?? null,
      }
    })
  )

  return c.json(enriched)
})

// DELETE /matches/:id — unmatch
app.delete('/:id', async (c) => {
  const userId = c.get('userId') as string
  const matchId = c.req.param('id')

  const [match] = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.userAId, userId), eq(matches.userBId, userId))
      )
    )
    .limit(1)

  if (!match) {
    return c.json({ message: 'Match not found' }, 404)
  }

  await db
    .update(matches)
    .set({ status: 'unmatched' })
    .where(eq(matches.id, matchId))

  return c.json({ success: true })
})

export { app as matchRoutes }
