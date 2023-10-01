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
    const { serverId, channelId } = req.query

    if (session == null) return res.status(401).json({ error: "Unauthorized" })
    if (serverId == null)
      return res.status(400).json({ error: "Server ID missing" })
    if (channelId == null)
      return res.status(400).json({ error: "Channel ID missing" })

    if (content == null)
      return res.status(400).json({ error: "Content missing" })

    const server = await prisma.server.findUniqueOrThrow({
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

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId as string,
        serverId: serverId as string
      }
    })

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" })
    }

    const member = server.members.find(
      member => member.userId === session.user.id
    )

    if (!member) {
      return res.status(404).json({ message: "Member not found" })
    }

    const message = await prisma.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        userId: session.user.id,
        serverId: server.id
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

    const channelKey = `chat:${channelId}:messages`
    res.socket.server.io.emit(channelKey, message)

    return res.status(200).json(message)
  } catch (error) {
    console.log("[MESSAGES_POST]", error)
    return res.status(500).json({ message: "Internal Error" })
  }
}
