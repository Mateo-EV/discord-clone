import "./globals.css"

import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { cn } from "@/lib/utils"

import AuthProvider from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { SocketProvider } from "@/components/providers/SocketProvider"

const font = Open_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Discord",
  description: "Discord Real-Time Chat & Video Application"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <SocketProvider>{children}</SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
