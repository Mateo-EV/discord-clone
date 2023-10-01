import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { createChannelSchema } from "@/schema"
import { MemberRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { URL } from "url"

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    const { name, type } = createChannelSchema.parse(await req.json())
    const { searchParams } = new URL(req.url)

    const serverId = searchParams.get("serverId")

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    if (serverId == null)
      return new NextResponse("Server ID missing", { status: 400 })

    const server = await prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId: session.user.id,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
          }
        }
      },
      data: {
        channels: {
          create: {
            userId: session.user.id,
            name,
            type
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("CHANNELS_POST", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
