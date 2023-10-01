import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { redirect } from "next/navigation"

type ServerPageProps = {
  params: {
    serverId: string
  }
}

export default async function ServerPage({ params }: ServerPageProps) {
  const session = await getServerAuthSession()

  const server = await prisma.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          userId: session?.user.id
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  })

  const initialChannel = server?.channels[0]

  if (initialChannel?.name !== "general") return null

  return redirect(`/servers/${params.serverId}/channels/${initialChannel.id}`)
}
