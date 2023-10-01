import MediaRoom from "@/components/MediaRoom"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatMessages } from "@/components/chat/ChatMessages"
import { getOrCreateConversation } from "@/lib/conversation"
import { prisma } from "@/lib/db"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { Session } from "next-auth"
import { redirect } from "next/navigation"

type MemberIdPageProps = {
  params: {
    memberId: string
    serverId: string
  }
  searchParams: {
    video?: boolean
  }
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const session = (await getServerAuthSession()) as Session

  const currentMember = await prisma.member.findUnique({
    where: {
      serverId_userId: {
        serverId: params.serverId,
        userId: session.user.id
      }
    }
  })

  if (currentMember == null) return redirect("/")

  const conversation = await getOrCreateConversation(
    params.serverId,
    currentMember.userId,
    params.memberId
  )

  if (conversation == null) {
    return redirect(`/servers/${params.serverId}`)
  }

  const { memberOne, memberTwo } = conversation
  const otherMember =
    memberOne.userId === session.user.id ? memberTwo : memberOne

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.user.image?.url}
        name={otherMember.user.name}
        serverId={params.serverId}
        type="conversation"
      />
      {searchParams.video ? (
        <MediaRoom audio={true} video={true} chatId={conversation.id} />
      ) : (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.user.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId: conversation.id }}
          />
          <ChatInput
            name={otherMember.user.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id
            }}
          />
        </>
      )}
    </div>
  )
}

export default MemberIdPage
