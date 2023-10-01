import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { NextResponse } from "next/server"
import { URL } from "url"

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerAuthSession()

    if (session == null) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const serverId = searchParams.get("serverId")

    if (serverId == null) {
      return new NextResponse("Server ID missing", { status: 400 })
    }

    if (params.memberId == null) {
      return new NextResponse("Member ID missing", { status: 400 })
    }

    const server = await prisma.server.update({
      where: { id: serverId, userId: session.user.id },
      data: {
        members: {
          delete: {
            serverId_userId: {
              serverId: serverId,
              userId: params.memberId
            },
            userId: { not: session.user.id }
          }
        }
      },
      include: {
        members: {
          include: { user: true },
          orderBy: {
            role: "asc"
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerAuthSession()

    if (session == null) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const { role } = await req.json()

    const serverId = searchParams.get("serverId")

    if (serverId == null) {
      return new NextResponse("Server ID missing", { status: 400 })
    }

    if (params.memberId == null) {
      return new NextResponse("Member ID missing", { status: 400 })
    }

    const server = await prisma.server.update({
      where: { id: serverId, userId: session.user.id },
      data: {
        members: {
          update: {
            where: {
              serverId_userId: {
                serverId: serverId,
                userId: params.memberId
              },
              userId: { not: session.user.id }
            },
            data: {
              role
            }
          }
        }
      },
      include: {
        members: {
          include: { user: true },
          orderBy: {
            role: "asc"
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
