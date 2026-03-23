'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Github } from 'lucide-react'
import { AvatarUpload } from './avatar-upload'
import { SkillTag } from './skill-tag'
import { apiClient } from '@/lib/api-client'
import type { Profile } from '@d2code/shared'

const POPULAR_SKILLS = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++',
  'React', 'Next.js', 'Vue', 'Svelte', 'Node.js', 'Hono', 'FastAPI',
  'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Supabase',
]

// Extended type to include relations returned by the API
interface ProfileWithRelations extends Profile {
  profileSkills?: { skill: { name: string }; level: string | null }[]
}

interface ProfileEditorProps {
  userId: string
}

export function ProfileEditor({ userId: _userId }: ProfileEditorProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const token = (session?.user as unknown as { accessToken?: string })?.accessToken

  const { data: profile, isLoading } = useQuery<ProfileWithRelations>({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profiles/me', { token }),
    enabled: !!session,
  })

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '')
      setCity(profile.city ?? '')
      setGithubUrl(profile.githubUrl ?? '')
      setAvatarUrl(profile.avatarUrl ?? null)
      setSelectedSkills(profile.profileSkills?.map((ps) => ps.skill.name) ?? [])
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.patch(
        '/profiles/me',
        { bio, city, githubUrl: githubUrl || null, skills: selectedSkills },
        { token }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-zinc-600" />
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-6"
    >
      {/* Avatar */}
      <div className="flex justify-center">
        <AvatarUpload
          currentUrl={avatarUrl}
          name={profile?.name ?? 'You'}
          onUploaded={(url) => setAvatarUrl(url)}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Tell other devs about yourself…"
          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
        />
        <p className="mt-1 text-right text-[11px] text-zinc-700">{bio.length}/300</p>
      </div>

      {/* City */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. San Francisco"
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
        />
      </div>

      {/* GitHub URL */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-300">
          <Github size={13} />
          GitHub URL
        </label>
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username"
          type="url"
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
        />
      </div>

      {/* Skills */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Skills</label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.map((skill) => {
            const active = selectedSkills.includes(skill)
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`transition-all duration-150 ${active ? 'scale-105' : ''}`}
              >
                <SkillTag
                  name={skill}
                  className={
                    active
                      ? 'border-violet-500/50 bg-violet-500/20 text-violet-200 cursor-pointer'
                      : 'cursor-pointer border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/[0.15] hover:text-zinc-300'
                  }
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="glow-primary flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {mutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
      </button>

      {mutation.isError && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          Failed to save. Please try again.
        </p>
      )}
    </form>
  )
}
