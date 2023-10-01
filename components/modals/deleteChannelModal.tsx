"use client"

import { useModal } from "@/hooks/useModalStore"
import { useRouter } from "next/navigation"

import { useState } from "react"
import axios from "axios"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/LoadingSpinner"

export const DeleteChannelModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { channel, server }
  } = useModal()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isModalOpen = isOpen && type === "deleteChannel"

  const handleClick = async () => {
    try {
      setIsLoading(true)

      await axios.delete(`/api/channels/${channel?.id}?serverId=${server?.id}`)

      onClose()
      router.refresh()
      router.push(`/servers/${server?.id}`)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">#{channel?.name}</span>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-600/90 text-white"
              onClick={handleClick}
            >
              {isLoading && <LoadingSpinner />}
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
