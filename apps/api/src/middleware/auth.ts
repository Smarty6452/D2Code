import type { Context, Next } from 'hono'
import { verify } from 'jsonwebtoken'

export interface AuthPayload {
  userId: string
  email: string
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as AuthPayload
    c.set('userId', payload.userId)
    c.set('email', payload.email)
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
}
