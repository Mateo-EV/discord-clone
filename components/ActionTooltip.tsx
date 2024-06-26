"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

type ActionTooltipProps = {
  label: string
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  children,
  side,
  align
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p className="font-semibold text-sm capitalize">{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
