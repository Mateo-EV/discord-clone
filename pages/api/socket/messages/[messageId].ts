import { prisma } from "@/lib/db"
import { getServerAuthSessionForPages } from "@/lib/getServerAuthSession"
import { NextApiResponseServerIo } from "@/types"
import { MemberRole } from "@prisma/client"
import { NextApiRequest } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const session = await getServerAuthSessionForPages(req, res)
    const { messageId, serverId, channelId } = req.query
    const { content } = req.body

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID missing" })
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID missing" })
    }

    const server = await prisma.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: true
      }
    })

    if (!server) {
      return res.status(404).json({ error: "Server not found" })
    }

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string
      }
    })

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" })
    }

    const member = server.members.find(
      member => member.userId === session.user.id
    )

    if (!member) {
      return res.status(404).json({ error: "Member not found" })
    }

    let message = await prisma.message.findUnique({
      where: {
        id: messageId as string,
        channelId: channelId as string
      },
      include: {
        member: {
          include: {
            user: {
              include: { image: true }
            }
          }
        }
      }
    })

    if (!message || message.deleted) {
      return res.status(404).json({ error: "Message not found" })
    }

    const isMessageOwner = message.userId === member.userId
    const isAdmin = member.role === MemberRole.ADMIN
    const isModerator = member.role === MemberRole.MODERATOR
    const canModify = isMessageOwner || isAdmin || isModerator

    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (req.method === "DELETE") {
      message = await prisma.message.update({
        where: {
          id: messageId as string
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted.",
          deleted: true
        },
        include: {
          member: {
            include: {
              user: {
                include: { image: true }
              }
            }
          }
        }
      })
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      message = await prisma.message.update({
        where: {
          id: messageId as string
        },
        data: {
          content
        },
        include: {
          member: {
            include: {
              user: {
                include: { image: true }
              }
            }
          }
        }
      })
    }

    const updateKey = `chat:${channelId}:messages:update`

    res?.socket?.server?.io?.emit(updateKey, message)

    return res.status(200).json(message)
  } catch (error) {
    console.log("[MESSAGE_ID]", error)
    return res.status(500).json({ error: "Internal Error" })
  }
}
