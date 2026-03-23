'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Send, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Message } from '@d2code/shared'

interface ChatThreadProps {
  matchId: string
}

export function ChatThread({ matchId }: ChatThreadProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['chat', matchId],
    queryFn: () =>
      apiClient.get(`/chat/${matchId}/messages`, {
        token: session?.user as unknown as string,
      }),
    enabled: !!session,
    refetchInterval: 3000,
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
      inputRef.current?.focus()
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const userId = session?.user?.id

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Header */}
      <div className="glass flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <Link
          href="/matches"
          className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="flex size-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
          D
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Developer</p>
          <p className="flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-4 py-4">
        {messages.length === 0 && (
          <div className="animate-fade-up flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-2xl">👋</p>
            <p className="text-sm text-zinc-500">Say hello and start a conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId
          const prevMsg = messages[i - 1]
          const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId
          return (
            <div
              key={msg.id}
              className={cn(
                'flex animate-fade-up',
                isMe ? 'justify-end' : 'justify-start',
                !isFirst && 'mt-0.5'
              )}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div
                className={cn(
                  'max-w-[72%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  isMe
                    ? 'rounded-br-md bg-violet-600 text-white'
                    : 'rounded-bl-md border border-white/[0.06] bg-white/[0.05] text-zinc-200'
                )}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="glass shrink-0 border-t border-white/[0.06] px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) sendMutation.mutate(text.trim())
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200',
              text.trim()
                ? 'bg-violet-600 text-white hover:bg-violet-500 glow-primary scale-100'
                : 'bg-white/5 text-zinc-600'
            )}
          >
            <Send size={15} className={sendMutation.isPending ? 'opacity-50' : ''} />
          </button>
        </form>
      </div>
    </div>
  )
}
