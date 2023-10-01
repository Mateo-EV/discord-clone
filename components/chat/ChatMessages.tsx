"use client"

import { Image, Member, Message, User } from "@prisma/client"
import { useChatQuery } from "@/hooks/useChatQuery"

import { ChatWelcome } from "@/components/chat/ChatWelcome"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ChatItem } from "@/components/chat/ChatItem"

import { format } from "date-fns"

import { ServerCrash } from "lucide-react"
import { useChatSocket } from "@/hooks/useChatSocket"
import { useRef } from "react"
import { useChatScroll } from "@/hooks/useChatScroll"

const DATE_FORMAT = "d MMM yyyy, HH:mm"

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    user: User & {
      image?: Image
    }
  }
}

type ChatMessageProps = {
  name: string
  member: Member
  chatId: string
  apiUrl: string
  socketUrl: string
  socketQuery: Record<string, string>
  paramKey: "channelId" | "conversationId"
  paramValue: string
  type: "channel" | "conversation"
}

export function ChatMessages({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type
}: ChatMessageProps) {
  const queryKey = `chat:${chatId}`
  const addKey = `${queryKey}:messages`
  const updateKey = `${queryKey}:messages:update`
  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue
    })

  useChatSocket({ queryKey, addKey, updateKey })
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0
  })

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center gap-4">
        <LoadingSpinner />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center gap-4">
        <ServerCrash className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    )
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <LoadingSpinner />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages
          .flatMap(page => page.items)
          .map((message: MessageWithMemberWithProfile) => (
            <ChatItem
              key={message.id}
              id={message.id}
              currentMember={member}
              member={message.member}
              content={message.content}
              fileUrl={message.fileUrl}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              isUpdated={message.updatedAt !== message.createdAt}
              socketUrl={socketUrl}
              socketQuery={socketQuery}
              queryKey={queryKey}
            />
          ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
