import { createClient } from '@supabase/supabase-js'

// Service-role client for server-side storage operations
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const AVATAR_BUCKET = 'avatars'

export function avatarPath(userId: string, ext: string) {
  return `${userId}/avatar.${ext}`
}

export function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
