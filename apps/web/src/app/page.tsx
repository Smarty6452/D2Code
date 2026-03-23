import Link from 'next/link'
import { Code2, MapPin, Zap, MessageCircle, Shield, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: MapPin,
    title: 'Location-based discovery',
    description: 'Find developers in your city or expand globally. Your radius, your rules.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Zap,
    title: 'Stack matching',
    description: 'Filter by languages, frameworks, and skill level. No noise, just signal.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: MessageCircle,
    title: 'Icebreaker prompts',
    description: 'Answer a few questions that actually matter. Real conversations from day one.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: Coffee,
    title: 'Code dates',
    description: 'Schedule pair-programming sessions or casual meetups. Build something together.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    description: 'You control your visibility. Only matched devs can see your full profile.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Code2,
    title: 'GitHub connected',
    description: 'Link your GitHub to showcase real projects and contributions automatically.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
  },
]

const stats = [
  { value: '10k+', label: 'Developers' },
  { value: '48', label: 'Countries' },
  { value: '2.4k', label: 'Code dates' },
  { value: '98%', label: 'Match rate' },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Background orbs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-orb-pulse absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(258 85% 65% / 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="animate-orb-pulse delay-300 absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(200 100% 60% / 0.10) 0%, transparent 70%)',
          }}
        />
        <div
          className="animate-orb-pulse delay-600 absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(258 85% 65% / 0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Top nav ── */}
      <header className="glass fixed inset-x-0 top-0 z-50 border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/20">
              <Code2 size={15} className="text-violet-300" />
            </span>
            <span className="font-semibold tracking-tight text-white">D2Code</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="glow-primary rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-36 text-center sm:px-6 sm:pt-44">
        {/* Beta badge */}
        <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          <span className="size-1.5 animate-pulse rounded-full bg-violet-400" />
          Now in beta — join thousands of developers
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-75 mb-5 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Find your{' '}
          <span className="gradient-text">dev match</span>
        </h1>

        <p className="animate-fade-up delay-150 mx-auto mb-10 max-w-xl text-base text-zinc-400 sm:text-lg">
          Connect with developers who share your stack, interests, and vibe. Chat, swap ideas, or
          schedule a{' '}
          <span className="font-medium text-amber-400">code date</span> to build something together.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-225 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="glow-primary rounded-xl bg-violet-600 px-8 text-white hover:bg-violet-500"
          >
            <Link href="/signup">Get Started — It&apos;s Free</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl border-white/10 bg-white/5 px-8 text-zinc-300 backdrop-blur hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="animate-fade-up delay-300 mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl px-6 py-4">
              <p className="gradient-text text-2xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative mx-auto max-w-5xl px-4 pb-32 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="animate-fade-up text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Everything you need to connect
          </h2>
          <p className="animate-fade-up delay-75 mt-2 text-sm text-zinc-500">
            Built by developers, for developers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, i) => {
            const Icon = feat.icon
            const delay = ['', 'delay-75', 'delay-150', 'delay-225', 'delay-300', 'delay-450'][i]
            return (
              <div
                key={feat.title}
                className={`animate-fade-up ${delay} glass-card group cursor-default rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]`}
              >
                <div
                  className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl border ${feat.bg}`}
                >
                  <Icon size={18} className={feat.color} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">{feat.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500">{feat.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} D2Code. Built by devs, for devs.
      </footer>
    </main>
  )
}
