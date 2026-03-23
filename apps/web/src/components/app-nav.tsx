'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code2, Compass, Heart, MessageCircle, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Session } from 'next-auth'

const navItems = [
  { href: '/discover',  icon: Compass,       label: 'Discover'  },
  { href: '/matches',   icon: Heart,         label: 'Matches'   },
  { href: '/chat',      icon: MessageCircle, label: 'Chat'      },
  { href: '/profile',   icon: User,          label: 'Profile'   },
  { href: '/settings',  icon: Settings,      label: 'Settings'  },
]

interface AppNavProps {
  user: Session['user']
}

export function AppNav({ user: _user }: AppNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop top nav (frosted glass) ── */}
      <nav className="glass fixed inset-x-0 top-0 z-50 hidden border-b border-white/[0.06] md:block">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/20">
              <Code2 size={15} className="text-violet-300" />
            </span>
            <span className="font-semibold tracking-tight text-white">D2Code</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-violet-500/15 text-violet-300 shadow-[0_0_12px_hsl(258_85%_65%/0.2)]'
                      : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav (glass) ── */}
      <nav className="glass fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] md:hidden">
        <div className="flex">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-200',
                  active ? 'text-violet-300' : 'text-zinc-600 hover:text-zinc-400'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-xl transition-all duration-200',
                    active && 'bg-violet-500/15'
                  )}
                >
                  <Icon size={18} />
                </span>
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
