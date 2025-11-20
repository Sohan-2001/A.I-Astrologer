"use client"

import { useState, useEffect } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import type { Message } from "@/app/lib/types";
import { BirthDetailsForm } from "@/components/birth-details-form";
import { getPrediction } from "@/ai/flows/get-prediction";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Show the initial form message only on the client
    setMessages([
      {
        id: 1,
        sender: 'them',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        component: <BirthDetailsForm onPrediction={handleNewPrediction} />
      }
    ]);
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

  const handleNewPrediction = (prediction: string) => {
    const newMessage: Message = {
      id: messages.length + 2, // ensure unique id
      text: prediction,
      sender: 'them',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // Remove the form and add the prediction
    setMessages(prev => [
      ...prev.filter(msg => !msg.component), 
      newMessage
    ]);
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
