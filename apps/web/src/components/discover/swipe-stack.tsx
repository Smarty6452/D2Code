'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ProfileCard } from '@/components/profile/profile-card'
import { Button } from '@/components/ui/button'
import { X, Heart } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { DiscoverProfile } from '@d2code/shared'

export function SwipeStack() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedProfile, setMatchedProfile] = useState<DiscoverProfile | null>(null)

  const { data: profiles = [], isLoading } = useQuery<DiscoverProfile[]>({
    queryKey: ['discover'],
    queryFn: () =>
      apiClient.get('/discover', { token: session?.user as unknown as string }),
    enabled: !!session,
  })

  const swipeMutation = useMutation({
    mutationFn: ({
      profileId,
      direction,
    }: {
      profileId: string
      direction: 'like' | 'pass'
    }) =>
      apiClient.post<{ matched: boolean }>(
        '/swipes',
        { swipedId: profileId, direction },
        { token: session?.user as unknown as string }
      ),
    onSuccess: (data, variables) => {
      if (data.matched) {
        const profile = profiles[currentIndex]
        if (profile) setMatchedProfile(profile)
      }
      setCurrentIndex((i) => i + 1)
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  const currentProfile = profiles[currentIndex]

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Finding nearby devs…
      </div>
    )
  }

  if (matchedProfile) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-white">It&apos;s a match!</h2>
        <p className="text-slate-400">
          You and <span className="text-white">{matchedProfile.name}</span> liked each other.
        </p>
        <div className="flex gap-3">
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setMatchedProfile(null)}
          >
            Keep Swiping
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Send Message
          </Button>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-4xl">🔭</div>
        <h2 className="text-xl font-semibold text-white">You&apos;ve seen everyone nearby</h2>
        <p className="text-slate-400">Try expanding your radius in settings.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="relative h-[520px]">
        <ProfileCard profile={currentProfile} />
      </div>
      <div className="flex justify-center gap-6">
        <Button
          size="icon"
          variant="outline"
          className="size-14 rounded-full border-slate-600 hover:border-red-500 hover:bg-red-500/10"
          onClick={() =>
            swipeMutation.mutate({ profileId: currentProfile.id, direction: 'pass' })
          }
          disabled={swipeMutation.isPending}
        >
          <X size={22} className="text-slate-300" />
        </Button>
        <Button
          size="icon"
          className="size-14 rounded-full bg-blue-500 hover:bg-blue-600"
          onClick={() =>
            swipeMutation.mutate({ profileId: currentProfile.id, direction: 'like' })
          }
          disabled={swipeMutation.isPending}
        >
          <Heart size={22} />
        </Button>
      </div>
    </div>
  )
}
