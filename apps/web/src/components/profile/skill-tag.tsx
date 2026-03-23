import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const levelColors = {
  beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  mid: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  senior: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
} as const

interface SkillTagProps {
  name: string
  level?: keyof typeof levelColors
  className?: string
}

export function SkillTag({ name, level, className }: SkillTagProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border text-xs font-medium',
        level ? levelColors[level] : 'border-slate-600 text-slate-300',
        className
      )}
    >
      {name}
    </Badge>
  )
}
