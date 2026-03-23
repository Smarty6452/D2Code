import Image from 'next/image'
import { MapPin, Github, ExternalLink } from 'lucide-react'
import { SkillTag } from './skill-tag'
import type { DiscoverProfile } from '@d2code/shared'

interface ProfileCardProps {
  profile: DiscoverProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="glass-card flex h-full flex-col overflow-hidden rounded-3xl">
      {/* ── Full-bleed avatar ── */}
      <div className="relative flex-1 min-h-0 bg-zinc-900" style={{ minHeight: '260px' }}>
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 400px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
            <span className="text-7xl font-bold text-white/20 select-none">
              {profile.name[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, hsl(220 14% 8%) 0%, hsl(220 14% 8% / 0.6) 35%, transparent 65%)',
          }}
        />

        {/* Name + location on top of gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-bold tracking-tight text-white">{profile.name}</h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <MapPin size={11} className="shrink-0" />
            <span>{profile.city ?? 'Nearby'}</span>
            {profile.distanceKm != null && (
              <>
                <span className="text-zinc-600">·</span>
                <span>{profile.distanceKm.toFixed(0)} km away</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content panel ── */}
      <div className="flex flex-col gap-3.5 p-4">
        {profile.bio && (
          <p className="text-sm leading-relaxed text-zinc-400">{profile.bio}</p>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <SkillTag key={s.skillId} name={s.name} level={s.level} />
              ))}
            </div>
          </div>
        )}

        {/* Icebreaker prompts */}
        {profile.prompts.length > 0 && (
          <div className="space-y-2">
            {profile.prompts.slice(0, 2).map((p) => (
              <div
                key={p.promptId}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                  {p.question}
                </p>
                <p className="text-sm text-zinc-300">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* GitHub */}
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-auto flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <Github size={12} />
            <span className="truncate">{profile.githubUrl.replace('https://github.com/', '')}</span>
            <ExternalLink size={10} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        )}
      </div>
    </div>
  )
}
