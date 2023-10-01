import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { DirectMessage, Message } from "@prisma/client"
import { NextResponse } from "next/server"

const MESSAGES_BATCH = 10

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    const { searchParams } = new URL(req.url)

    const cursor = searchParams.get("cursor")
    const conversationId = searchParams.get("conversationId")

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    if (conversationId == null)
      return new NextResponse("Conversation ID missing", { status: 400 })

    let messages: DirectMessage[] = []

    if (cursor) {
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor
        },
        where: {
          conversationId
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
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    } else {
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId
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
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    }

    let nextCursor = null

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id
    }

    return NextResponse.json({
      items: messages,
      nextCursor
    })
  } catch (error) {
    console.log("[MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
