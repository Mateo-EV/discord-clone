"use client"

import { Image as ImagePrisma, Member, MemberRole, User } from "@prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"

import Image from "next/image"
import qs from "query-string"
import axios from "axios"

import { Edit, FileIcon, ShieldCheck, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UserAvatar } from "@/components/UserAvatar"
import { ActionTooltip } from "@/components/ActionTooltip"
import { Form, FormField, FormControl, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { useModal } from "@/hooks/useModalStore"
import { useParams, useRouter } from "next/navigation"

type ChatItemProps = {
  id: string
  content: string
  member: Member & {
    user: User & {
      image?: ImagePrisma
    }
  }
  timestamp: string
  fileUrl: string | null
  deleted: boolean
  currentMember: Member
  isUpdated: boolean
  socketUrl: string
  socketQuery: Record<string, string>
  queryKey: string
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldCheck className="h-4 w-4 ml-2 text-red-500" />
}

const formSchema = z.object({
  content: z.string().min(1)
})

export const ChatItem = ({
  id,
  content,
  member,
  currentMember,
  timestamp,
  fileUrl,
  deleted,
  isUpdated,
  socketQuery,
  socketUrl,
  queryKey
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { onOpen } = useModal()
  const router = useRouter()
  const params = useParams()

  const onMemberClick = () => {
    if (member.userId === currentMember.userId) {
      return
    }

    router.push(`/servers/${params?.serverId}/conversations/${member.userId}`)
  }

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keyDown", handleKeyDown)
  }, [])

  const fileType = fileUrl?.split(".").pop()

  const isAdmin = currentMember.role === MemberRole.ADMIN
  const isModerator = currentMember.role === MemberRole.MODERATOR
  const isOwner = currentMember.userId === member.userId
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && !fileUrl

  const isPDF = fileType === "pdf" && fileUrl
  const isImage = !isPDF && fileUrl

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content
    }
  })

  const isLoading = form.formState.isSubmitting
  // const queryClient = useQueryClient()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery
      })
      await axios.patch(url, values)

      // queryClient.setQueryData([queryKey], (oldData: any) => {
      //   if (oldData == null) return

      //   return {
      //     ...oldData,
      //     pages: oldData.pages.map((page: any) => {
      //       return {
      //         ...page,
      //         items: page.items.map((message: any) => {
      //           if (message.id === id) {
      //             return {
      //               ...message,
      //               content: values.content
      //             }
      //           }
      //           return message
      //         })
      //       }
      //     })
      //   }
      // })
      form.reset()
      setIsEditing(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    form.reset({
      content: content
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          onClick={onMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition"
        >
          <UserAvatar
            src={member.user.image?.url}
            fallBack={member.user.name.slice(0, 2).toUpperCase()}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {member.user.name}
              </p>
              <ActionTooltip label={member.role.toLowerCase()}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md mt-2 overflow-hidden border grid place-items-center bg-secondary w-48 py-4"
            >
              <Image
                src={fileUrl}
                alt={content}
                className="object-contain"
                width={166}
                height={166}
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  )
}
