'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Eye, EyeOff, MapPin, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Profile } from '@d2code/shared'

const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250] as const

export function SettingsPanel() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const token = (session?.user as unknown as { accessToken?: string })?.accessToken

  const [radius, setRadius] = useState(25)
  const [visible, setVisible] = useState(true)
  const [saved, setSaved] = useState(false)

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profiles/me', { token }),
    enabled: !!session,
  })

  useEffect(() => {
    if (profile) {
      setRadius(profile.radiusKm ?? 25)
      setVisible(profile.visibility ?? true)
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.patch('/profiles/me', { radiusKm: radius, visibility: visible }, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  return (
    <div className="space-y-4">
      {/* Discovery radius */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={15} className="text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Discovery radius</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              className={`rounded-xl py-2 text-sm font-medium transition-all duration-150 ${
                radius === r
                  ? 'bg-violet-600 text-white glow-primary'
                  : 'border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div className="glass-card rounded-2xl p-5">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {visible ? (
              <Eye size={15} className="text-emerald-400" />
            ) : (
              <EyeOff size={15} className="text-zinc-500" />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {visible ? 'Visible to others' : 'Hidden from discovery'}
              </p>
              <p className="text-xs text-zinc-500">
                {visible
                  ? 'Other devs can find your profile'
                  : 'You won\'t appear in anyone\'s feed'}
              </p>
            </div>
          </div>
          {/* Toggle */}
          <div
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              visible ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                visible ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="glow-primary flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {mutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* Divider */}
      <div className="pt-2">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* Account section */}
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Account
        </p>
        <div className="space-y-1 text-sm text-zinc-400">
          <p>
            Signed in as{' '}
            <span className="font-medium text-zinc-200">{session?.user?.email}</span>
          </p>
        </div>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
      >
        <LogOut size={14} />
        Sign Out
      </button>
    </div>
  )
}
