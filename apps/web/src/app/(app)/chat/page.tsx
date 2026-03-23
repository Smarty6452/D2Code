import { MatchList } from '@/components/matches/match-list'

// /chat redirects to the matches list so users pick a conversation
export default function ChatIndexPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Messages</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Your conversations</p>
      </div>
      <MatchList />
    </div>
  )
}
