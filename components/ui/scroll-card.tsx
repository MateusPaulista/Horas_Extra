"use client"

import { forwardRef } from "react"
import { Card, type CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScrollCardProps extends CardProps {
  maxHeight?: string
  enableInternalScroll?: boolean
}

const ScrollCard = forwardRef<HTMLDivElement, ScrollCardProps>(
  ({ className, maxHeight = "400px", enableInternalScroll = true, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        data-card="true"
        className={cn("relative", enableInternalScroll && "overflow-hidden", className)}
        style={{
          maxHeight: enableInternalScroll ? maxHeight : undefined,
        }}
        {...props}
      >
        {enableInternalScroll ? <div className="overflow-y-auto h-full custom-scrollbar">{children}</div> : children}
      </Card>
    )
  },
)

ScrollCard.displayName = "ScrollCard"

export { ScrollCard }
