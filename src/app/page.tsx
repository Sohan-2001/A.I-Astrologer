
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import type { Message } from "@/app/lib/types";
import { BirthDetailsForm } from "@/components/birth-details-form";
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from "@/firebase";
import { addDoc, collection, serverTimestamp, query, orderBy, deleteDoc, getDocs, setDoc, doc } from "firebase/firestore";
import { chat } from "@/ai/flows/chat";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { PredictionCards } from "@/components/prediction-cards";
import { getPrediction } from "@/ai/flows/get-prediction";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
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
  
  const handleNewPrediction = useCallback(async (formData: any) => {
    if (!user || !firestore || !messagesCollection) return;

    // Clear any previous messages if a new prediction is made.
    const existingMessages = await getDocs(messagesCollection);
    for (const doc of existingMessages.docs) {
      await deleteDoc(doc.ref);
    }
    
    const predictionData = await getPrediction(formData);

    const predictionMessage: Omit<Message, 'id' | 'timestamp'> = {
      predictionData,
      sender: 'them',
      senderId: 'ai-astrologer'
    };
    const predictionMessageWithTimestamp = { ...predictionMessage, timestamp: serverTimestamp() };
    await addDoc(messagesCollection, predictionMessageWithTimestamp);
  }, [user, firestore, messagesCollection]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      await setDoc(doc(firestore, "users", currentUser.uid), {
          displayName: currentUser.displayName,
          email: currentUser.email,
          id: currentUser.uid,
          profilePictureUrl: currentUser.photoURL,
      }, { merge: true });
      toast({
        title: "Signed In!",
        description: `Welcome, ${result.user.displayName}!`,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    }
  };

  
  const displayMessages = useMemo(() => {
    const formattedMessages = messages?.map(msg => {
       const timestamp = msg.timestamp ? (msg.timestamp as any).toDate ? (msg.timestamp as any).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';

      let component;
      if (msg.predictionData) {
        component = <PredictionCards predictionData={msg.predictionData} />;
      } else if (msg.component) {
        component = msg.component
      }

      return {
        ...msg,
        timestamp,
        component
      }
    }) || [];
    
    if (isMounted && !isUserLoading && user && messages?.length === 0 && !isLoadingMessages) {
       return [
         {
           id: "form-1",
           sender: 'them' as const,
           senderId: 'ai-astrologer',
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           component: <BirthDetailsForm onPrediction={handleNewPrediction} />
         }
       ];
    }

    return formattedMessages;
  }, [messages, isMounted, isUserLoading, user, isLoadingMessages, handleNewPrediction]);


  if (!isMounted || isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline mb-2">Welcome to A.I. Astrologer</h1>
          <p className="text-muted-foreground">Sign in to get your personalized astrological reading.</p>
        </div>
        <Button onClick={handleSignIn}>Sign in with Google</Button>
      </div>
    );
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
