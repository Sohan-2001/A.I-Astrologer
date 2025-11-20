
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import type { Message } from "@/app/lib/types";
import { BirthDetailsForm } from "@/components/birth-details-form";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp, query, orderBy, deleteDoc, getDocs } from "firebase/firestore";
import { chat } from "@/ai/flows/chat";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  const messagesCollection = useMemoFirebase(() => 
    user && firestore ? collection(firestore, 'users', user.uid, 'messages') : null
  , [user, firestore]);
  
  const messagesQuery = useMemoFirebase(() => 
    messagesCollection ? query(messagesCollection, orderBy('timestamp', 'asc')) : null
  , [messagesCollection]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!user || !firestore || !messagesCollection) return;

    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      text,
      sender: 'me',
      senderId: user.uid,
    };
    
    // Save user message to Firestore
    const userMessageWithTimestamp = { ...userMessage, timestamp: serverTimestamp() };
    await addDoc(messagesCollection, userMessageWithTimestamp);

    // Prepare history for AI
    const history = messages?.map(msg => ({
      role: msg.sender === 'me' ? 'user' as const : 'model' as const,
      content: [{ text: msg.text || '' }]
    })) ?? [];

    // Get AI response
    const aiResponse = await chat({
      history,
      message: text,
    });

    const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
      text: aiResponse,
      sender: 'them',
      senderId: 'ai-astrologer',
    };
    
    // Save AI message to Firestore
    const aiMessageWithTimestamp = { ...aiMessage, timestamp: serverTimestamp() };
    await addDoc(messagesCollection, aiMessageWithTimestamp);
  };
  
  const handleNewPrediction = useCallback(async (prediction: string) => {
    if (!user || !firestore || !messagesCollection) return;

    // Clear any previous messages if a new prediction is made.
    const existingMessages = await getDocs(messagesCollection);
    for (const doc of existingMessages.docs) {
      await deleteDoc(doc.ref);
    }

    const predictionMessage: Omit<Message, 'id' | 'timestamp'> = {
      text: prediction,
      sender: 'them',
      senderId: 'ai-astrologer'
    };
    const predictionMessageWithTimestamp = { ...predictionMessage, timestamp: serverTimestamp() };
    await addDoc(messagesCollection, predictionMessageWithTimestamp);
  }, [user, firestore, messagesCollection]);

  
  const displayMessages = useMemo(() => {
    const formattedMessages = messages?.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? (msg.timestamp as any).toDate ? (msg.timestamp as any).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
    })) || [];
    
    if (isMounted && !isUserLoading && user && messages?.length === 0 && !isLoadingMessages) {
       return [
         {
           id: "form-1",
           sender: 'them' as const,
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           component: <BirthDetailsForm onPrediction={handleNewPrediction} />
         }
       ];
    }

    return formattedMessages;
  }, [messages, isMounted, isUserLoading, user, isLoadingMessages, handleNewPrediction]);


  if (!isMounted) {
    return null;
  }

  const isChatDisabled = !user || (!isLoadingMessages && messages?.length === 0);
  
  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatMessages messages={displayMessages} />
      </main>
      <ChatInput onSendMessage={handleSendMessage} disabled={isChatDisabled} />
    </div>
  );
}

