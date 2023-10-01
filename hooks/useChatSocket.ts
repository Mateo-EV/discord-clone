import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Image, Member, Message, User } from "@prisma/client"

import { useSocket } from "@/components/providers/SocketProvider"

type ChatSocketProps = {
  addKey: string
  updateKey: string
  queryKey: string
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: User & {
      image?: Image
    }
  }
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) {
      return
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message
              }
              return item
            })
          }
        })

        return {
          ...oldData,
          pages: newData
        }
      })
    })

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message]
              }
            ]
          }
        }

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              items: [message, ...oldData.pages[0].items]
            },
            ...oldData.pages.slice(1)
          ]
        }
      })
    })

    return () => {
      socket.off(addKey)
      socket.off(updateKey)
    }
  }, [queryClient, addKey, queryKey, socket, updateKey])
}
