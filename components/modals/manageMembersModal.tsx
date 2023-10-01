"use client"

import axios from "axios"

import { useModal } from "@/hooks/useModalStore"
import { MemberRole } from "@prisma/client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/UserAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "@/components/LoadingSpinner"

import {
  Check,
  Gavel,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />
}

export const ManageMembersModal = () => {
  const router = useRouter()
  const {
    isOpen,
    onClose,
    type,
    onOpen,
    data: { server }
  } = useModal()
  const [loadingId, setLoadingId] = useState("")
  const isModalOpen = isOpen && type === "manageMembers"

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId)
      const url = `/api/members/${memberId}?serverId=${server?.id}`
      const response = await axios.delete(url)
      router.refresh()
      onOpen("manageMembers", { server: response.data })
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingId("")
    }
  }

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId)
      const url = `/api/members/${memberId}?serverId=${server?.id}`
      const response = await axios.patch(url, { role })
      router.refresh()
      onOpen("manageMembers", { server: response.data })
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingId("")
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map(member => (
            <div key={member.userId} className="flex items-center gap-x-2 mb-6">
              <UserAvatar
                src={member.user.image?.url}
                fallBack={member.user.name.substring(0, 2).toUpperCase()}
              />
              <div className="flex flex-col gap-y-1">
                <div className="text-sx font-semibold flex items-center gap-x-1">
                  {member.user.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text.xs text-zinc-500">{member.user.email}</p>
              </div>
              {server.userId !== member.userId &&
                loadingId !== member.userId && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4 text-zinc-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center">
                            <ShieldQuestion className="w-4 h-4 mr-2" />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  onRoleChange(member.userId, "GUEST")
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Guest
                                {member.role === "GUEST" && (
                                  <Check className="h-4 w-4 ml-2" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  onRoleChange(member.userId, "MODERATOR")
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Moderator
                                {member.role === "MODERATOR" && (
                                  <Check className="h-4 w-4 ml-2" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onKick(member.userId)}>
                          <Gavel className="h-4 w-4 mr-2" />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              {loadingId === member.userId && <LoadingSpinner />}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
