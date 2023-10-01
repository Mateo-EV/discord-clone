"use client"

import { CreateServerModal } from "@/components/modals/createServerModal"
import { InviteToServerModal } from "@/components/modals/inviteToServerModal"
import { EditServerModal } from "@/components/modals/editServerModal"
import { ManageMembersModal } from "@/components/modals/manageMembersModal"
import { CreateChannelModal } from "@/components/modals/createChannelModal"
import { LeaveServerModal } from "@/components/modals/leaveServerModal"
import { DeleteServerModal } from "@/components/modals/deleteServerModal"
import { DeleteChannelModal } from "@/components/modals/deleteChannelModal"
import { EditChannelModal } from "@/components/modals/editChannelModal"
import { MessageFileModal } from "@/components/modals/messageFileModal"
import { DeleteMessageModal } from "@/components/modals/deleteMessageModal"

import { useEffect, useState } from "react"

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

  return (
    <>
      <CreateServerModal />
      <InviteToServerModal />
      <EditServerModal />
      <ManageMembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  )
}
