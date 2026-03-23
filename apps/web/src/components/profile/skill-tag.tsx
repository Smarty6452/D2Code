import { cn } from '@/lib/utils'

const levelStyles = {
  beginner: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  mid:      'border-indigo-500/30  bg-indigo-500/10  text-indigo-300',
  senior:   'border-violet-500/30  bg-violet-500/10  text-violet-300',
} as const

interface SkillTagProps {
  name: string
  level?: keyof typeof levelStyles
  className?: string
}

export function SkillTag({ name, level, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-all duration-200',
        level ? levelStyles[level] : 'border-white/10 bg-white/5 text-zinc-400',
        className
      )}
    >
      {name}
    </span>
  )
}
