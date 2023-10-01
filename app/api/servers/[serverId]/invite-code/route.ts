import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { MemberRole } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await getServerAuthSession()

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    const { serverId } = params

    if (serverId == null)
      return new NextResponse("Server ID Missing", { status: 400 })

    const member = await prisma.member.findUnique({
      where: {
        serverId_userId: { serverId: serverId, userId: session.user.id },
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
      }
    })

    if (member == null) return new NextResponse("Unauthorized", { status: 401 })

    const server = await prisma.server.update({
      where: { id: serverId },
      data: { inviteCode: randomUUID() }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVERS_ID]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
