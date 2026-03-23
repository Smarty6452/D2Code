import { Hono } from 'hono'
import { db } from '../db/client'
import { profiles } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import { supabase, AVATAR_BUCKET, avatarPath, getPublicUrl } from '../lib/supabase'

const app = new Hono()

app.use('*', authMiddleware)

// POST /uploads/avatar
// Accepts multipart/form-data with field "file"
app.post('/avatar', async (c) => {
  const userId = c.get('userId') as string

  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || typeof file === 'string') {
    return c.json({ message: 'No file provided' }, 400)
  }

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ message: 'File must be JPEG, PNG, or WebP' }, 400)
  }

  // Validate size (max 5 MB)
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ message: 'File must be under 5 MB' }, 400)
  }

  const ext = file.type.split('/')[1] ?? 'jpg'
  const path = avatarPath(userId, ext)

  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error('Supabase storage error:', error)
    return c.json({ message: 'Upload failed' }, 500)
  }

  const publicUrl = getPublicUrl(path)

  // Update profile with new avatar URL
  await db
    .update(profiles)
    .set({ avatarUrl: publicUrl, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))

  return c.json({ avatarUrl: publicUrl })
})

export { app as uploadRoutes }
