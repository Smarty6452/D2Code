import Image from 'next/image'
import { MapPin, Github } from 'lucide-react'
import { SkillTag } from './skill-tag'
import type { DiscoverProfile } from '@d2code/shared'

interface ProfileCardProps {
  profile: DiscoverProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
      {/* Avatar */}
      <div className="relative h-64 shrink-0 bg-slate-800">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-slate-600">
            {profile.name[0]?.toUpperCase()}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-4">
          <h2 className="text-xl font-bold text-white">{profile.name}</h2>
          <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-300">
            <MapPin size={13} />
            {profile.city ?? 'Nearby'} · {profile.distanceKm?.toFixed(0)} km away
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {profile.bio && <p className="text-sm text-slate-400">{profile.bio}</p>}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <SkillTag key={s.skillId} name={s.name} level={s.level} />
              ))}
            </div>
          </div>
        )}

        {/* Prompts */}
        {profile.prompts.length > 0 && (
          <div className="space-y-2">
            {profile.prompts.slice(0, 2).map((p) => (
              <div key={p.promptId} className="rounded-lg bg-slate-800 p-3">
                <p className="mb-0.5 text-xs text-slate-500">{p.question}</p>
                <p className="text-sm text-slate-200">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* GitHub link */}
        {profile.githubUrl && (
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <Github size={13} />
            {profile.githubUrl.replace('https://github.com/', '')}
          </a>
        )}
      </div>
    </div>
  )
}
