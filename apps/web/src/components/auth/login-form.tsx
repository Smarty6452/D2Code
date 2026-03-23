'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Github, Loader2, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
      return
    }

    router.push('/discover')
  }

  return (
    <div className="space-y-4">
      {/* GitHub SSO */}
      <button
        type="button"
        onClick={() => signIn('github', { callbackUrl: '/discover' })}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white"
      >
        <Github size={16} />
        Continue with GitHub
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-white/[0.06]" />
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-700">or</span>
        <div className="flex-1 border-t border-white/[0.06]" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="animate-fade-in rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="glow-primary flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
