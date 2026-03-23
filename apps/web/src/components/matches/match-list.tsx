'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { Match } from '@d2code/shared'

function MatchSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="skeleton size-12 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-2.5 w-48 rounded" />
      </div>
    </div>
  )
}

export function MatchList() {
  const { data: session } = useSession()

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () =>
      apiClient.get('/matches', { token: session?.user as unknown as string }),
    enabled: !!session,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => <MatchSkeleton key={i} />)}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="animate-fade-up mt-20 flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/[0.03] text-4xl">
          💔
        </div>
        <p className="text-sm font-medium text-zinc-500">No matches yet</p>
        <p className="text-xs text-zinc-700">Go discover some devs!</p>
        <Link
          href="/discover"
          className="mt-2 rounded-xl bg-violet-600/20 px-5 py-2 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-600/30"
        >
          Start discovering →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {matches.map((match, i) => (
        <Link
          key={match.id}
          href={`/chat/${match.id}`}
          className={cn(
            'animate-fade-up group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]',
            'p-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.05]'
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Avatar */}
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-white/[0.06] transition-all group-hover:ring-violet-500/30">
            {match.otherProfile.avatarUrl ? (
              <Image
                src={match.otherProfile.avatarUrl}
                alt={match.otherProfile.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400">
                {match.otherProfile.name[0]?.toUpperCase()}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-400 glow-green" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{match.otherProfile.name}</p>
            <p className="truncate text-xs text-zinc-600">
              {match.lastMessage ?? 'Say hello! 👋'}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={15}
            className="shrink-0 text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400"
          />
        </Link>
      ))}
    </div>
  )
}
