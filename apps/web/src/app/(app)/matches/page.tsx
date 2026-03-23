import { MatchList } from '@/components/matches/match-list'

export default function MatchesPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Matches</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Developers who liked you back</p>
      </div>
      <MatchList />
    </div>
  )
}
