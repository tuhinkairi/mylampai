import React from 'react'
import { cn } from "@/lib/utils"

interface CaptionProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  className?: string
}

export default function Caption({ text, className, ...props }: CaptionProps) {
  console.log("caption ", text)
  return (
    text &&
    <div
      className={cn(
        "absolute z-10 bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-60 text-white text-center rounded",
        className
      )}
      {...props}
    >
      <p className="text-lg font-semibold">{text}</p>
    </div>
  )
}