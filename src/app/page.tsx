"use client"

import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import type { Message } from "@/app/lib/types";

const initialMessages: Message[] = [
  { id: 1, text: "Hey! How's it going?", sender: 'them', timestamp: "10:00 AM" },
  { id: 2, text: "Hey Zoe! I'm doing great, thanks for asking. Just working on a new project. How about you?", sender: 'me', timestamp: "10:01 AM" },
  { id: 3, text: "That sounds exciting! I'm good, just enjoying a cup of coffee. What's the project about?", sender: 'them', timestamp: "10:02 AM" },
  { id: 4, text: "It's a modern messaging app UI, actually. Pretty meta, right? Trying to get the chat bubbles just right.", sender: 'me', timestamp: "10:03 AM" },
];

const wittyReplies = [
  "Haha, very meta! Hope you're not getting stuck in an infinite loop of messaging about messaging apps.",
  "Sounds cool! Can I be a beta tester?",
  "Let me know if you need any 'user feedback'. I'm an expert in sending emojis. 😉",
  "Nice! I bet it will look amazing with that sky blue theme you like.",
  "Don't forget to add a feature to send virtual coffee! ☕️"
];

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

    // Simulate a reply from the other user
    setTimeout(() => {
      const replyText = wittyReplies[Math.floor(Math.random() * wittyReplies.length)];
      const replyMessage: Message = {
        id: messages.length + 2, // This is not a safe way to generate IDs in a real app
        text: replyText,
        sender: 'them',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1500);
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
