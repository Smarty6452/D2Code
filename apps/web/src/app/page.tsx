import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto max-w-4xl px-6 text-center">
        {/* Logo / Hero */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
          <span className="size-2 animate-pulse rounded-full bg-blue-400" />
          Now in beta — join the waitlist
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
          Find your{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            dev match
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Connect with nearby developers who share your tech stack, interests, and vibe. Chat, swap
          ideas, or schedule a <span className="text-cyan-400">code date</span> to build something
          together.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-blue-500 px-8 hover:bg-blue-600">
            <Link href="/signup">Get Started — It&apos;s Free</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-slate-600 px-8 text-slate-300 hover:bg-slate-800"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {[
            '📍 Location-based discovery',
            '🛠️ Match by tech stack',
            '💬 Icebreaker prompts',
            '☕ Code dates',
            '🔒 Privacy-first',
          ].map((feat) => (
            <span
              key={feat}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm text-slate-300"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
