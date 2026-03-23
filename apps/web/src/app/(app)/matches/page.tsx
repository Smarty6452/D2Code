import { MatchList } from '@/components/matches/match-list'

export default function MatchesPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Matches</h1>
      <MatchList />
    </div>
  )
}
