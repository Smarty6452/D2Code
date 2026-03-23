'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import type { Profile } from '@d2code/shared'

interface ProfileEditorProps {
  userId: string
}

export function ProfileEditor({ userId: _userId }: ProfileEditorProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient.get('/profiles/me', { token: session?.user as unknown as string }),
    enabled: !!session,
  })

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '')
      setCity(profile.city ?? '')
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data: Partial<Profile>) =>
      apiClient.patch('/profiles/me', data, {
        token: session?.user as unknown as string,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  if (isLoading) {
    return <div className="text-slate-400">Loading profile…</div>
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate({ bio, city })
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Tell other devs a bit about yourself…"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">City</label>
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. San Francisco"
          className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
        />
      </div>
      <Button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving…' : 'Save Changes'}
      </Button>
      {mutation.isError && (
        <p className="text-sm text-red-400">Failed to save. Please try again.</p>
      )}
    </form>
  )
}
