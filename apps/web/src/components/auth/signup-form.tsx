'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiClient.post('/auth/signup', { email, password, name })
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Account created but sign-in failed. Try logging in.')
        return
      }
      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
        onClick={() => signIn('github', { callbackUrl: '/onboarding' })}
      >
        <Github size={16} />
        Continue with GitHub
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-950 px-2 text-slate-500">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
        />
        <Input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
    </div>
  )
}
