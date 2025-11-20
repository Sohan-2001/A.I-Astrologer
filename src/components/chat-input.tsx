
"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <footer className="p-3 border-t bg-background/95 backdrop-blur-sm sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <Textarea
          placeholder={disabled ? "Please complete the form above to start chatting." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none max-h-40 min-h-[40px] rounded-2xl bg-card border-input focus-visible:ring-1"
          disabled={disabled}
        />
        <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={disabled || !message.trim()}>
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </footer>
  )
}
