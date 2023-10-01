import { prisma } from "@/lib/db"
import { getServerAuthSessionForPages } from "@/lib/getServerAuthSession"
import { NextApiResponseServerIo } from "@/types"
import { NextApiRequest } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" })

  try {
    const session = await getServerAuthSessionForPages(req, res)
    const { content, fileUrl } = req.body
    const { conversationId } = req.query

    if (session == null) return res.status(401).json({ error: "Unauthorized" })
    if (conversationId == null)
      return res.status(400).json({ error: "Conversation ID missing" })

    if (content == null)
      return res.status(400).json({ error: "Content missing" })

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              userId: session.user.id
            }
          },
          {
            memberTwo: {
              userId: session.user.id
            }
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        },
        memberTwo: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    const member =
      conversation.memberOne.userId === session.user.id
        ? conversation.memberOne
        : conversation.memberOne

    if (!member) {
      return res.status(404).json({ message: "Member not found" })
    }

    const message = await prisma.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId as string,
        memberUserId: member.userId,
        memberServerId: member.serverId
      },
      include: {
        member: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })

    const channelKey = `chat:${conversationId}:messages`
    res.socket.server.io.emit(channelKey, message)

    return res.status(200).json(message)
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error)
    return res.status(500).json({ message: "Internal Error" })
  }
}
