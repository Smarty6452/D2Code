'use client'

import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ProfileCard } from '@/components/profile/profile-card'
import { X, Heart, RotateCcw, MessageCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { DiscoverProfile } from '@d2code/shared'

/* ── Drag state ── */
interface DragState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

const SWIPE_THRESHOLD = 100   // px to trigger swipe
const ROTATION_FACTOR = 0.08  // deg per px

function SwipeCard({
  profile,
  onSwipe,
  isTop,
  stackIndex,
}: {
  profile: DiscoverProfile
  onSwipe: (direction: 'like' | 'pass') => void
  isTop: boolean
  stackIndex: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, rotate: 0 })
  const [isFlying, setIsFlying] = useState(false)
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop || isFlying) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        isDragging: true,
      }
    },
    [isTop, isFlying]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current?.isDragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    dragRef.current.currentX = e.clientX
    dragRef.current.currentY = e.clientY
    setTransform({
      x: dx,
      y: dy * 0.4,
      rotate: dx * ROTATION_FACTOR,
    })
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current?.isDragging) return
    const dx = dragRef.current.currentX - dragRef.current.startX
    dragRef.current.isDragging = false

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      const dir = dx > 0 ? 'right' : 'left'
      setFlyDirection(dir)
      setIsFlying(true)
      setTransform({
        x: dx > 0 ? 600 : -600,
        y: 0,
        rotate: dx > 0 ? 30 : -30,
      })
      setTimeout(() => onSwipe(dx > 0 ? 'like' : 'pass'), 320)
    } else {
      // Snap back
      setTransform({ x: 0, y: 0, rotate: 0 })
    }
    dragRef.current = null
  }, [onSwipe])

  // Stack appearance for back cards
  const scale = 1 - stackIndex * 0.04
  const translateY = stackIndex * 10

  // Drag indicators
  const likeOpacity = Math.max(0, Math.min(1, transform.x / SWIPE_THRESHOLD))
  const passOpacity = Math.max(0, Math.min(1, -transform.x / SWIPE_THRESHOLD))

  return (
    <div
      ref={cardRef}
      style={{
        transform: isTop
          ? `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg)`
          : `translateY(${translateY}px) scale(${scale})`,
        transition: isTop
          ? dragRef.current?.isDragging
            ? 'none'
            : isFlying
            ? 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10 - stackIndex,
        position: 'absolute',
        inset: 0,
        transformOrigin: 'center bottom',
        cursor: isTop ? (dragRef.current?.isDragging ? 'grabbing' : 'grab') : 'default',
        willChange: 'transform',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <ProfileCard profile={profile} />

      {/* ── Swipe indicators ── */}
      {isTop && (
        <>
          <div
            className="pointer-events-none absolute left-5 top-7 rotate-[-20deg] rounded-xl border-2 border-emerald-400 px-3 py-1"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-lg font-black uppercase tracking-widest text-emerald-400">
              Like
            </span>
          </div>
          <div
            className="pointer-events-none absolute right-5 top-7 rotate-[20deg] rounded-xl border-2 border-red-400 px-3 py-1"
            style={{ opacity: passOpacity }}
          >
            <span className="text-lg font-black uppercase tracking-widest text-red-400">
              Nope
            </span>
          </div>
        </>
      )}

      {/* Fly direction hint overlay */}
      {isTop && flyDirection === 'right' && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, hsl(160 84% 39% / 0.15) 0%, transparent 60%)',
          }}
        />
      )}
      {isTop && flyDirection === 'left' && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(225deg, hsl(0 72% 55% / 0.15) 0%, transparent 60%)',
          }}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────── */

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
    mutationFn: ({ profileId, direction }: { profileId: string; direction: 'like' | 'pass' }) =>
      apiClient.post<{ matched: boolean }>(
        '/swipes',
        { swipedId: profileId, direction },
        { token: session?.user as unknown as string }
      ),
    onSuccess: (data) => {
      if (data.matched) {
        const profile = profiles[currentIndex]
        if (profile) setMatchedProfile(profile)
      }
      setCurrentIndex((i) => i + 1)
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  const currentProfile = profiles[currentIndex]
  const nextProfile    = profiles[currentIndex + 1]
  const thirdProfile   = profiles[currentIndex + 2]

  /* ── Swipe via button ── */
  const handleButtonSwipe = (dir: 'like' | 'pass') => {
    if (!currentProfile || swipeMutation.isPending) return
    swipeMutation.mutate({ profileId: currentProfile.id, direction: dir })
    setCurrentIndex((i) => i + 1)
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <div className="skeleton h-[520px] w-full rounded-3xl" />
        <div className="flex gap-5">
          <div className="skeleton size-14 rounded-full" />
          <div className="skeleton size-14 rounded-full" />
        </div>
      </div>
    )
  }

  /* ── Match modal ── */
  if (matchedProfile) {
    return (
      <div className="animate-scale-in glass-card flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl p-8 text-center">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: 'hsl(258 85% 65% / 0.3)' }}
          />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-violet-500/20 text-3xl">
            🎉
          </div>
        </div>
        <div>
          <h2 className="gradient-text text-3xl font-bold tracking-tight">It&apos;s a match!</h2>
          <p className="mt-2 text-sm text-zinc-400">
            You and{' '}
            <span className="font-semibold text-white">{matchedProfile.name}</span>{' '}
            liked each other.
          </p>
        </div>
        <div className="flex w-full gap-3">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
            onClick={() => setMatchedProfile(null)}
          >
            <RotateCcw size={14} />
            Keep swiping
          </button>
          <Link
            href="/chat"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500 glow-primary"
          >
            <MessageCircle size={14} />
            Message
          </Link>
        </div>
      </div>
    )
  }

  /* ── Exhausted ── */
  if (!currentProfile) {
    return (
      <div className="animate-fade-up glass-card flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <div className="text-5xl">🔭</div>
        <h2 className="text-lg font-semibold text-white">You&apos;ve seen everyone nearby</h2>
        <p className="text-sm text-zinc-500">Try expanding your radius in settings.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      {/* Card stack */}
      <div className="relative h-[520px] w-full">
        {thirdProfile && (
          <SwipeCard
            key={`${currentIndex + 2}`}
            profile={thirdProfile}
            onSwipe={() => {}}
            isTop={false}
            stackIndex={2}
          />
        )}
        {nextProfile && (
          <SwipeCard
            key={`${currentIndex + 1}`}
            profile={nextProfile}
            onSwipe={() => {}}
            isTop={false}
            stackIndex={1}
          />
        )}
        <SwipeCard
          key={`${currentIndex}`}
          profile={currentProfile}
          onSwipe={(dir) =>
            swipeMutation.mutate({ profileId: currentProfile.id, direction: dir })
          }
          isTop
          stackIndex={0}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-5">
        {/* Pass */}
        <button
          aria-label="Pass"
          disabled={swipeMutation.isPending}
          onClick={() => handleButtonSwipe('pass')}
          className="group flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 shadow-lg transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 hover:scale-110 active:scale-95 disabled:opacity-40"
          style={{ boxShadow: '0 4px 24px hsl(0 0% 0% / 0.4)' }}
        >
          <X size={22} />
        </button>

        {/* Like */}
        <button
          aria-label="Like"
          disabled={swipeMutation.isPending}
          onClick={() => handleButtonSwipe('like')}
          className="group flex size-16 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-all duration-200 hover:bg-violet-500 hover:scale-110 active:scale-95 disabled:opacity-40 glow-primary"
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Progress hint */}
      <p className="text-xs text-zinc-700">
        {currentIndex} seen · {profiles.length - currentIndex} remaining
      </p>
    </div>
  )
}
