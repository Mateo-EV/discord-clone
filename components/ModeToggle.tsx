"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const handleClickModeToggle = React.useCallback(() => {
    if (theme === "light") setTheme("dark")
    else setTheme("light")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  return (
    <Button
      className="bg-transparent border-0"
      variant="secondary"
      size="icon"
      onClick={handleClickModeToggle}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
