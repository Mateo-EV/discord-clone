import { redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { ServerSidebar } from "@/components/server/ServerSidebar"

export default async function ServerIdLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { serverId: string }
}) {
  const session = await getServerAuthSession()

  const server = await prisma.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          userId: session?.user.id
        }
      }
    }
  })

  if (!server) return redirect("/")

  return (
    <div className="h-full">
      <div className="hidden md:flex fixed h-full w-60 z-20 flex-col inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  )
}
