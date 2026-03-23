import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/client'
import { swipes, matches } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import { swipeSchema } from '@d2code/shared'

const app = new Hono()

app.use('*', authMiddleware)

// POST /swipes
app.post('/', zValidator('json', swipeSchema), async (c) => {
  const userId = c.get('userId') as string
  const { swipedId, direction } = c.req.valid('json')

  if (userId === swipedId) {
    return c.json({ message: 'Cannot swipe yourself' }, 400)
  }

  // Insert swipe (ignore conflict — idempotent)
  await db
    .insert(swipes)
    .values({ swiperId: userId, swipedId, direction })
    .onConflictDoNothing()

  // Check for mutual like
  let matched = false
  if (direction === 'like') {
    const [theirLike] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swipedId),
          eq(swipes.swipedId, userId),
          eq(swipes.direction, 'like')
        )
      )
      .limit(1)

    if (theirLike) {
      // Create match with consistent ordering (smaller UUID first) to avoid duplicates
      const [userA, userB] = [userId, swipedId].sort()
      await db
        .insert(matches)
        .values({ userAId: userA!, userBId: userB! })
        .onConflictDoNothing()
      matched = true
    }
  }

  return c.json({ matched })
})

export { app as swipeRoutes }
