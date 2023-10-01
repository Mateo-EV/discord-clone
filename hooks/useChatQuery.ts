import { useInfiniteQuery } from "@tanstack/react-query"

import { useSocket } from "@/components/providers/SocketProvider"

interface ChatQueryProps {
  queryKey: string
  apiUrl: string
  paramKey: "channelId" | "conversationId"
  paramValue: string
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue
}: ChatQueryProps) => {
  const { isConnected } = useSocket()

  const fetchMessages = async ({ pageParam = undefined }) => {
    let url = `${apiUrl}?`

    if (pageParam !== undefined) url += `cursor=${pageParam}&`
    if (paramValue !== undefined) url += `${paramKey}=${paramValue}&`

    const res = await fetch(url.slice(0, -1))
    return res.json()
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: lastPage => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000
    })

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  }
}
