import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/client'
import { users, profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema, signupSchema } from '@d2code/shared'

const app = new Hono()

app.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { email, password, name } = c.req.valid('json')

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return c.json({ message: 'Email already in use' }, 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const [user] = await db.insert(users).values({ email, passwordHash }).returning()

  await db.insert(profiles).values({
    userId: user!.id,
    name,
  })

  const token = jwt.sign(
    { userId: user!.id, email: user!.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return c.json({ id: user!.id, email: user!.email, accessToken: token }, 201)
})

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user?.passwordHash) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return c.json({ id: user.id, email: user.email, accessToken: token })
})

export { app as authRoutes }
