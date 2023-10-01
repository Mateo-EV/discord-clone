import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { ImageableType, MemberRole } from "@prisma/client"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

export const createServerSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required"
  }),
  image: z.string().min(1, {
    message: "Server image is required"
  })
})

export type ResponseServerPost = { id: string }

export async function POST(req: Request) {
  try {
    const { name, image } = createServerSchema.parse(await req.json())

    const session = await getServerAuthSession()

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    const { user } = session
    const server = await prisma.server.create({
      data: {
        userId: user.id,
        name,
        inviteCode: randomUUID(),
        image: {
          create: {
            url: image,
            imageableType: ImageableType.Server
          }
        },
        channels: {
          create: [{ name: "general", userId: user.id }]
        },
        members: {
          create: [{ userId: user.id, role: MemberRole.ADMIN }]
        }
      }
    })

    return NextResponse.json({ id: server.id })
  } catch (error) {
    console.log("[SERVERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
