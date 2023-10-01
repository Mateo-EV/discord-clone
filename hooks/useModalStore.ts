import { WithMembersWidthProfilesNullable } from "@/types"
import { Channel, ChannelType } from "@prisma/client"
import { create } from "zustand"

export type ModalType =
  | "createServer"
  | "inviteToServer"
  | "editServer"
  | "manageMembers"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage"

type ModalData = {
  server?: WithMembersWidthProfilesNullable
  channelType?: ChannelType
  channel?: Channel
  apiUrl?: string
  query?: Record<string, any>
}

type ModalStore = {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
}

export const useModal = create<ModalStore>(set => ({
  type: null,
  isOpen: false,
  data: {},
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null })
}))
