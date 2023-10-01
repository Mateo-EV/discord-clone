import { redirect } from "next/navigation"
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react"

import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { ChannelType, MemberRole } from "@prisma/client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { ServerHeader } from "@/components/server/ServerHeader"
import { ServerSearch } from "@/components/server/ServerSearch"
import { ServerSection } from "@/components/server/ServerSection"
import { ServerChannel } from "@/components/server/ServerChannel"
import { ServerMember } from "@/components/server/ServerMember"

type ServerSidebarProps = {
  serverId: string
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
}

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const session = await getServerAuthSession()

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          userId: session?.user.id
        }
      }
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc"
        }
      },
      members: {
        include: {
          user: {
            include: { image: true }
          }
        },
        orderBy: {
          role: "asc"
        }
      },
      image: true
    }
  })

  if (server == null) return redirect("/")

  const textChannels = server.channels.filter(
    channel => channel.type === ChannelType.TEXT
  )
  const audioChannels = server.channels.filter(
    channel => channel.type === ChannelType.AUDIO
  )
  const videoChannels = server.channels.filter(
    channel => channel.type === ChannelType.VIDEO
  )

  const members = server.members.filter(
    member => member.userId !== session?.user.id
  )
  const role = server.members.find(
    member => member.userId === session?.user.id
  )?.role

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Members",
                type: "member",
                data: members?.map(member => ({
                  id: member.userId,
                  name: member.user.name,
                  icon: roleIconMap[member.role]
                }))
              }
            ]}
          />
        </div>
        <Separator className="bg-zinc.200 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels.length && (
          <div className="mb-2">
            <ServerSection
              label="Text Channels"
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
            />
            {textChannels.map(channel => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                server={server}
              />
            ))}
          </div>
        )}
        {!!audioChannels.length && (
          <div className="mb-2">
            <ServerSection
              label="Voice Channels"
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
            />
            {audioChannels.map(channel => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                server={server}
              />
            ))}
          </div>
        )}
        {!!videoChannels.length && (
          <div className="mb-2">
            <ServerSection
              label="Video Channels"
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={role}
            />
            {videoChannels.map(channel => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                server={server}
              />
            ))}
          </div>
        )}
        {!!members.length && (
          <div className="mb-2">
            <ServerSection
              label="Members"
              sectionType="members"
              role={role}
              server={server}
            />
            {members.map(member => (
              <ServerMember
                key={member.userId}
                member={member}
                server={server}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
