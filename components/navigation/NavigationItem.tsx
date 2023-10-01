"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { ActionTooltip } from "@/components/ActionTooltip"

type NavigationItemProps = {
  id: string
  image: string
  name: string
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  id,
  image,
  name
}) => {
  const params = useParams()
  const router = useRouter()

  const handleClickNavigationItem = () => router.push(`/servers/${id}`)

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={handleClickNavigationItem}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-[height] w-[4px]",
            params.serverId !== id && "group-hover:h-[20px]",
            params.serverId === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-[border-radius_background-color] overflow-hidden",
            params.serverId === id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image fill src={image} alt="Server" />
        </div>
      </button>
    </ActionTooltip>
  )
}
