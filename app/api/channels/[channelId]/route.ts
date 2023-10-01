import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { ChannelType, MemberRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"

export const editChannelSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required"
    })
    .refine(name => name !== "general", {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
})

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerAuthSession()
    const { name, type } = editChannelSchema.parse(await req.json())
    const { searchParams } = new URL(req.url)

    const serverId = searchParams.get("serverId")

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    if (serverId == null)
      return new NextResponse("Server ID missing", { status: 400 })

    if (params.channelId == null)
      return new NextResponse("Channel ID missing", { status: 400 })

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
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general"
              }
            },
            data: {
              name,
              type
            }
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("CHANNEL_EDIT", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerAuthSession()
    const { searchParams } = new URL(req.url)

    const serverId = searchParams.get("serverId")

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    if (serverId == null)
      return new NextResponse("Server ID missing", { status: 400 })

    if (params.channelId == null)
      return new NextResponse("Channel ID missing", { status: 400 })

    const server = await prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId: session.user.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "general"
            }
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("CHANNEL_ID_DELETE", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
