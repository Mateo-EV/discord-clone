"use client"

import { Check, Copy, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { useModal } from "@/hooks/useModalStore"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Server } from "@prisma/client"
import axios from "axios"

export const InviteToServerModal = () => {
  const {
    onOpen,
    isOpen,
    onClose,
    type,
    data: { server }
  } = useModal()

  const isModalOpen = isOpen && type === "inviteToServer"

  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const origin = process.env.NEXT_PUBLIC_SITE_URL
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`

  useEffect(() => setCopied(false), [inviteUrl])

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
  }

  const onNew = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.patch<Server>(
        `/api/servers/${server?.id}/invite-code`
      )
      onOpen("inviteToServer", { server: data })
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bol text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-zinc-300/50 border-0 focus-visible:ring text-black focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={onCopy}
              disabled={isLoading}
              className={cn(copied && "bg-green-600 hover:bg-green-600")}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-2 px-0"
            disabled={isLoading}
            onClick={onNew}
          >
            Generate a new link
            <RefreshCw
              className={cn("w-4 h-4 ml-2", isLoading && "animate-spin")}
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
