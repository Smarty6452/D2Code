import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/client'
import { messages, matches } from '../db/schema'
import { and, eq, or, asc } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import { sendMessageSchema } from '@d2code/shared'

const app = new Hono()

app.use('*', authMiddleware)

// GET /chat/:matchId/messages
app.get('/:matchId/messages', async (c) => {
  const userId = c.get('userId') as string
  const matchId = c.req.param('matchId')

  // Verify the user is part of this match
  const [match] = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.userAId, userId), eq(matches.userBId, userId)),
        eq(matches.status, 'active')
      )
    )
    .limit(1)

  if (!match) {
    return c.json({ message: 'Match not found or unauthorized' }, 404)
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.matchId, matchId))
    .orderBy(asc(messages.sentAt))
    .limit(100)

  return c.json(msgs)
})

// POST /chat/:matchId/messages
app.post('/:matchId/messages', zValidator('json', sendMessageSchema), async (c) => {
  const userId = c.get('userId') as string
  const matchId = c.req.param('matchId')
  const { content } = c.req.valid('json')

  // Verify the user is part of this match
  const [match] = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.userAId, userId), eq(matches.userBId, userId)),
        eq(matches.status, 'active')
      )
    )
    .limit(1)

  if (!match) {
    return c.json({ message: 'Match not found or unauthorized' }, 404)
  }

  const [message] = await db
    .insert(messages)
    .values({ matchId, senderId: userId, content })
    .returning()

  return c.json(message, 201)
})

export { app as chatRoutes }
