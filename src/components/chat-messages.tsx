"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Message } from "@/app/lib/types"

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 sm:p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full animate-in fade-in zoom-in-95",
              message.sender === "me" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md",
                message.sender === "me"
                  ? "bg-primary/90 text-primary-foreground rounded-br-none"
                  : "bg-card/80 text-card-foreground rounded-bl-none border border-border/50 backdrop-blur-sm"
              )}
            >
              {message.component ? (
                message.component
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}
              <p className="text-xs mt-2 text-right opacity-60">
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
