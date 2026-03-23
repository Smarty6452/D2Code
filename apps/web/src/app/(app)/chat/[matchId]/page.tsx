import { ChatThread } from '@/components/chat/chat-thread'

interface ChatPageProps {
  params: Promise<{ matchId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { matchId } = await params
  return <ChatThread matchId={matchId} />
}
