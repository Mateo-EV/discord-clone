import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { redirect } from "next/navigation"

type InviteCodePageProps = {
  params: {
    inviteCode: string
  }
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const session = await getServerAuthSession()

  if (params.inviteCode == null) return redirect("/")

  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          userId: session?.user.id
        }
      }
    }
  })

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`)
  }

  const server = await prisma.server.update({
    where: {
      inviteCode: params.inviteCode
    },
    data: {
      members: {
        create: [
          {
            userId: session?.user.id as string
          }
        ]
      }
    }
  })

  if (server) return redirect(`/servers/${server.id}`)
}

export default InviteCodePage
