import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/client'
import { profiles, profileSkills, skills, profilePrompts, prompts } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import { updateProfileSchema } from '@d2code/shared'

const app = new Hono()

app.use('*', authMiddleware)

// GET /profiles/me
app.get('/me', async (c) => {
  const userId = c.get('userId') as string

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: {
      profileSkills: {
        with: { skill: true },
      },
      profilePrompts: {
        with: { prompt: true },
      },
    },
  })

  if (!profile) {
    return c.json({ message: 'Profile not found' }, 404)
  }

  return c.json(profile)
})

// PATCH /profiles/me
app.patch('/me', zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId') as string
  const data = c.req.valid('json')

  const { skills: skillNames, prompts: promptAnswers, ...profileData } = data

  await db
    .update(profiles)
    .set({ ...profileData, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))

  // Upsert skills if provided
  if (skillNames && skillNames.length > 0) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    })
    if (!profile) return c.json({ message: 'Profile not found' }, 404)

    // Delete existing skill associations
    await db.delete(profileSkills).where(eq(profileSkills.profileId, profile.id))

    // Find or create skills and associate
    for (const name of skillNames) {
      let [skill] = await db.select().from(skills).where(eq(skills.name, name)).limit(1)
      if (!skill) {
        ;[skill] = await db.insert(skills).values({ name }).returning()
      }
      await db
        .insert(profileSkills)
        .values({ profileId: profile.id, skillId: skill!.id })
        .onConflictDoNothing()
    }
  }

  // Upsert prompts if provided
  if (promptAnswers && promptAnswers.length > 0) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    })
    if (!profile) return c.json({ message: 'Profile not found' }, 404)

    await db.delete(profilePrompts).where(eq(profilePrompts.profileId, profile.id))

    for (const { question, answer } of promptAnswers) {
      let [prompt] = await db
        .select()
        .from(prompts)
        .where(eq(prompts.questionText, question))
        .limit(1)
      if (!prompt) {
        ;[prompt] = await db.insert(prompts).values({ questionText: question }).returning()
      }
      await db.insert(profilePrompts).values({
        profileId: profile.id,
        promptId: prompt!.id,
        answer,
      })
    }
  }

  return c.json({ success: true })
})

export { app as profileRoutes }
