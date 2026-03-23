'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { useGeolocation } from '@/hooks/use-geolocation'

const POPULAR_SKILLS = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++',
  'React', 'Next.js', 'Vue', 'Svelte', 'Node.js', 'Hono', 'FastAPI',
  'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Supabase',
]

const FUN_PROMPTS = [
  'I debug with…',
  'My spirit animal framework is…',
  'My unpopular tech opinion:',
  'The first thing I do in a new codebase:',
  'My superpower as a dev:',
]

export function OnboardingFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const { lat, lng } = useGeolocation()
  const [step, setStep] = useState(0)
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [prompts, setPrompts] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.patch(
        '/profiles/me',
        {
          bio,
          city,
          locationLat: lat,
          locationLng: lng,
          skills: selectedSkills,
          prompts: Object.entries(prompts).map(([question, answer]) => ({ question, answer })),
          onboardingComplete: true,
        },
        { token: session?.user as unknown as string }
      ),
    onSuccess: () => router.push('/discover'),
  })

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 0: Bio + City */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Short bio <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="e.g. Full-stack dev building open source tools. Love Rust + TypeScript."
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">City</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New York"
              className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={() => setStep(1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Step 1: Skills */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Pick at least 1 skill to continue.</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={selectedSkills.length === 0}
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Fun prompts */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Answer a couple of prompts to break the ice.{' '}
            <span className="text-slate-500">(optional but fun)</span>
          </p>
          {FUN_PROMPTS.slice(0, 3).map((prompt) => (
            <div key={prompt}>
              <label className="mb-1 block text-sm text-slate-300">{prompt}</label>
              <Input
                value={prompts[prompt] ?? ''}
                onChange={(e) => setPrompts((p) => ({ ...p, [prompt]: e.target.value }))}
                placeholder="Your answer…"
                maxLength={150}
                className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving…' : 'Finish Setup'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>
      )}
    </div>
  )
}
