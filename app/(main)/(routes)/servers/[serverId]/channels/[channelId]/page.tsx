import { redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"

import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatMessages } from "@/components/chat/ChatMessages"
import { ChannelType } from "@prisma/client"
import MediaRoom from "@/components/MediaRoom"

type ChannelIdPageProps = {
  params: {
    serverId: string
    channelId: string
  }
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const session = await getServerAuthSession()

  if (session == null) {
    return redirect("/")
  }

  const channel = await prisma.channel.findUnique({
    where: {
      id: params.channelId
    }
  })

  const member = await prisma.member.findUnique({
    where: {
      serverId_userId: {
        serverId: params.serverId,
        userId: session.user.id
      }
    }
  })

  if (channel == null || member == null) {
    return redirect("/")
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            name={channel.name}
            member={member}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{ channelId: channel.id, serverId: channel.serverId }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} audio={true} video={false} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} audio={true} video={true} />
      )}
    </div>
  )
}

export default ChannelIdPage
