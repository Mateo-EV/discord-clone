"use client"

import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"

type ServerSearchProps = {
  data: {
    label: string
    type: "channel" | "member"
    data:
      | {
          id: string
          name: string
          icon: React.ReactNode
        }[]
      | undefined
  }[]
}

export const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prevOpen => !prevOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const onClick = ({
    id,
    type
  }: {
    id: string
    type: "channel" | "member"
  }) => {
    setOpen(false)

    if (type === "member")
      return router.push(`/servers/${params?.serverId}/conversations/${id}`)

    if (type === "channel")
      return router.push(`/servers/${params?.serverId}/channels/${id}`)
  }

  return (
    <>
      <button
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-event-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">ctrl</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <ScrollArea className="max-h-[300px]">
          <CommandList className="max-h-[auto] overflow-auto">
            <CommandEmpty>No Results Found</CommandEmpty>
            {data.map(({ label, type, data }) => {
              if (!data?.length) return null

              return (
                <CommandGroup key={label} heading={label}>
                  {data.map(({ id, name, icon }) => (
                    <CommandItem
                      key={id}
                      onSelect={() => onClick({ id, type })}
                      className="cursor-pointer"
                    >
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </ScrollArea>
      </CommandDialog>
    </>
  )
}
