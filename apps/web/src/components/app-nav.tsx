'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code2, Heart, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Session } from 'next-auth'

const navItems = [
  { href: '/discover', icon: Code2, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/profile', icon: User, label: 'Profile' },
]

interface AppNavProps {
  user: Session['user']
}

export function AppNav({ user: _user }: AppNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden border-b border-slate-800 bg-slate-900 md:block">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/discover" className="flex items-center gap-2 font-bold text-white">
            <Code2 className="text-blue-400" size={22} />
            D2Code
          </Link>
          <div className="flex gap-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900 md:hidden">
        <div className="flex">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                pathname.startsWith(href) ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
