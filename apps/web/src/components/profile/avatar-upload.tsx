'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface AvatarUploadProps {
  currentUrl: string | null | undefined
  name: string
  onUploaded?: (url: string) => void
}

export function AvatarUpload({ currentUrl, name, onUploaded }: AvatarUploadProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB')
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const token = (session?.user as { accessToken?: string })?.accessToken
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_BASE}/uploads/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? 'Upload failed')
      }

      const data = (await res.json()) as { avatarUrl: string }
      onUploaded?.(data.avatarUrl)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = preview ?? currentUrl
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative size-24 overflow-hidden rounded-2xl bg-zinc-800 transition-all hover:ring-2 hover:ring-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        {displayUrl ? (
          <Image src={displayUrl} alt={name} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40 text-xl font-bold text-white/40">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-white transition-opacity',
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Camera size={18} />
              <span className="text-[10px] font-medium">Change</span>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-[11px] text-zinc-600">JPEG, PNG or WebP · max 5 MB</p>
    </div>
  )
}
