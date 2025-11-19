"use client"

import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import type { Message } from "@/app/lib/types";

const initialMessages: Message[] = [];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  if (!isMounted) {
    // Avoids hydration errors by not rendering UI that depends on client-side state until mounted
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatMessages messages={messages} />
      </main>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
