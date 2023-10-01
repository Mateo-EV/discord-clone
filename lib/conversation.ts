import { prisma } from "./db"

export const getOrCreateConversation = async (
  serverId: string,
  memberOneUserId: string,
  memberTwoUserId: string
) => {
  let conversation =
    (await findConversation(serverId, memberOneUserId, memberTwoUserId)) ||
    (await findConversation(serverId, memberTwoUserId, memberOneUserId))

  if (!conversation) {
    conversation = await createNewConversation(
      serverId,
      memberOneUserId,
      memberTwoUserId
    )
  }

  return conversation
}

const findConversation = async (
  serverId: string,
  memberOneUserId: string,
  memberTwoUserId: string
) => {
  try {
    return await prisma.conversation.findUniqueOrThrow({
      where: {
        memberOneUserId_memberTwoUserId_memberServerId: {
          memberOneUserId,
          memberTwoUserId,
          memberServerId: serverId
        }
      },
      include: {
        memberOne: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        },
        memberTwo: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })
  } catch {
    return null
  }
}

const createNewConversation = async (
  serverId: string,
  memberOneUserId: string,
  memberTwoUserId: string
) => {
  try {
    return await prisma.conversation.create({
      data: {
        memberOneUserId,
        memberTwoUserId,
        memberServerId: serverId
      },
      include: {
        memberOne: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        },
        memberTwo: {
          include: {
            user: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })
  } catch {
    return null
  }
}
