import { InitialModal } from "@/components/modals/InitialModal"
import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { redirect } from "next/navigation"

export default async function SetUp() {
  const session = await getServerAuthSession()

  const server = await prisma.server.findFirst({
    where: {
      members: {
        some: {
          userId: session?.user.id
        }
      }
    }
  })

  if (server) {
    return redirect(`/servers/${server.id}`)
  }

  return <InitialModal />
}
