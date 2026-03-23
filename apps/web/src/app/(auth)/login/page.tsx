import { LoginForm } from '@/components/auth/login-form'
import { Code2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="animate-orb-pulse absolute -left-24 top-1/4 h-[400px] w-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(258 85% 65% / 0.12) 0%, transparent 70%)' }}
        />
        <div
          className="animate-orb-pulse delay-300 absolute -right-24 bottom-1/4 h-[350px] w-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(200 100% 60% / 0.08) 0%, transparent 70%)' }}
        />
      </div>

      <div className="animate-scale-in relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/20">
              <Code2 size={18} className="text-violet-300" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">D2Code</span>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">Welcome back</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-violet-400 transition-colors hover:text-violet-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
