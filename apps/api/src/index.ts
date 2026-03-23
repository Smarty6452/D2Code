import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profiles'
import { discoverRoutes } from './routes/discover'
import { swipeRoutes } from './routes/swipes'
import { matchRoutes } from './routes/matches'
import { chatRoutes } from './routes/chat'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.route('/auth', authRoutes)
app.route('/profiles', profileRoutes)
app.route('/discover', discoverRoutes)
app.route('/swipes', swipeRoutes)
app.route('/matches', matchRoutes)
app.route('/chat', chatRoutes)

// 404 fallback
app.notFound((c) => c.json({ message: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'Internal server error' }, 500)
})

const port = parseInt(process.env.PORT ?? '3001', 10)

serve({ fetch: app.fetch, port }, () => {
  console.log(`D2Code API running on http://localhost:${port}`)
})

export default app
