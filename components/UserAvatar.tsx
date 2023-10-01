"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  src?: string
  className?: string
  fallBack?: string
}

export const UserAvatar = ({ src, className, fallBack }: UserAvatarProps) => {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={src} />
      <AvatarFallback className="bg-indigo-500 text-slate-200">
        {fallBack}
      </AvatarFallback>
    </Avatar>
  )
}
