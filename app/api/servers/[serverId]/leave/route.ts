import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await getServerAuthSession()

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    if (params.serverId == null)
      return new NextResponse("Server ID missing", { status: 400 })

    const server = await prisma.server.update({
      where: {
        id: params.serverId,
        userId: {
          not: session.user.id
        },
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      data: {
        members: {
          delete: {
            serverId_userId: {
              serverId: params.serverId,
              userId: session.user.id
            }
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVER_ID_LEAVE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
