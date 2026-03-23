'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { Message } from '@d2code/shared'

interface ChatThreadProps {
  matchId: string
}

export function ChatThread({ matchId }: ChatThreadProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['chat', matchId],
    queryFn: () =>
      apiClient.get(`/chat/${matchId}/messages`, {
        token: session?.user as unknown as string,
      }),
    enabled: !!session,
    refetchInterval: 3000, // poll until Supabase Realtime is wired
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.post(
        `/chat/${matchId}/messages`,
        { content },
        { token: session?.user as unknown as string }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', matchId] })
      setText('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const userId = session?.user?.id

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === userId
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  isMe
                    ? 'rounded-br-sm bg-blue-500 text-white'
                    : 'rounded-bl-sm bg-slate-800 text-slate-100'
                )}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) sendMutation.mutate(text.trim())
          }}
          className="flex gap-2"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 bg-blue-500 hover:bg-blue-600"
            disabled={!text.trim() || sendMutation.isPending}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}
