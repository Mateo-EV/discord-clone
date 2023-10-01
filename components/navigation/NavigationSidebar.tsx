import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { redirect } from "next/navigation"
import { ImageableType } from "@prisma/client"

import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/ModeToggle"

import { NavigationAction } from "./NavigationAction"
import { NavigationItem } from "./NavigationItem"

export const NavigationSidebar = async () => {
  const session = await getServerAuthSession()

  if (session == null) redirect("/")

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      image: {
        select: { url: true },
        where: { imageableType: ImageableType.Server }
      }
    }
  })

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10" />
      <ScrollArea className="flex-1 w-full">
        {servers.map(server => (
          <div key={server.id} className="mb-4">
            <NavigationItem {...server} image={server.image?.url as string} />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
      </div>
    </div>
  )
}
