'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Match } from '@d2code/shared'

export function MatchList() {
  const { data: session } = useSession()

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () =>
      apiClient.get('/matches', { token: session?.user as unknown as string }),
    enabled: !!session,
  })

  if (isLoading) {
    return <div className="text-slate-400">Loading matches…</div>
  }

  if (matches.length === 0) {
    return (
      <div className="mt-16 text-center">
        <div className="mb-3 text-4xl">💔</div>
        <p className="text-slate-400">No matches yet — go discover some devs!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/chat/${match.id}`}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 transition-colors hover:bg-slate-800"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-slate-700">
            {match.otherProfile.avatarUrl ? (
              <Image
                src={match.otherProfile.avatarUrl}
                alt={match.otherProfile.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-semibold text-slate-400">
                {match.otherProfile.name[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{match.otherProfile.name}</p>
            <p className="truncate text-sm text-slate-500">
              {match.lastMessage ?? 'Say hello!'}
            </p>
          </div>
          <MessageCircle size={16} className="shrink-0 text-slate-600" />
        </Link>
      ))}
    </div>
  )
}
