import { ChannelType } from "@prisma/client"
import { z } from "zod"

export const editChannelSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required"
    })
    .refine(name => name !== "general", {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
})

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required"
    })
    .refine(name => name !== "general", {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
})

export const createServerSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required"
  }),
  image: z.string().min(1, {
    message: "Server image is required"
  })
})
