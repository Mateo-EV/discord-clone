import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { NextResponse } from "next/server"
import { createServerSchema } from "../route"
import { utapi } from "uploadthing/server"

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await getServerAuthSession()
    const { name, image } = createServerSchema.parse(await req.json())

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    const server = await prisma.server.update({
      where: {
        id: params.serverId
      },
      data: {
        name,
        image: {
          update: {
            url: image
          }
        }
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVER_ID_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const session = await getServerAuthSession()

    if (session == null)
      return new NextResponse("Unauthorized", { status: 401 })

    const server = await prisma.server.delete({
      where: {
        id: params.serverId,
        userId: session.user.id
      },
      include: {
        image: true
      }
    })

    if (server) {
      const url = server.image?.url as string
      const code = url.slice(url.lastIndexOf("/") + 1)
      utapi.deleteFiles(code)
    }

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVER_ID_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
