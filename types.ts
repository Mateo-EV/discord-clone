import { Image, Member, Server, User } from "@prisma/client"
import { Server as NetServer, Socket } from "net"
import { NextApiResponse } from "next"
import { Server as SocketIOServer } from "socket.io"

export type ServerWithMembersWidthProfiles = Server & {
  members: (Member & { user: User & { image: Image | null } })[]
  image: Image | null
}

export type WithMembersWidthProfilesNullable = Server & {
  image?: Image | null
  members?: (Member & { user: User & { image: Image | null } })[]
}

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}
