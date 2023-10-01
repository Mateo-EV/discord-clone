"use client"

import "@livekit/components-styles"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import { useSession } from "next-auth/react"
import { LoadingSpinner } from "./LoadingSpinner"

type MediaRoomProps = {
  chatId: string
  video: boolean
  audio: boolean
}

export default function MediaRoom({ chatId, video, audio }: MediaRoomProps) {
  const session = useSession()
  const [token, setToken] = useState("")

  useEffect(() => {
    if (session.data == null) return

    const name = session.data?.user.name
    ;(async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${chatId}&username=${name}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [chatId, session])

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <LoadingSpinner />
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      video={video}
      audio={audio}
      connect={true}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}
