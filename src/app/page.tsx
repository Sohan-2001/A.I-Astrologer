

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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sparkles } from 'lucide-react';


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
  
  const landingPageBg = PlaceHolderImages.find(p => p.id === 'landing-page-bg');


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
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
        {landingPageBg && (
           <Image
            src={landingPageBg.imageUrl}
            alt={landingPageBg.description}
            data-ai-hint={landingPageBg.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center text-center text-white p-4">
          <Sparkles className="w-16 h-16 mb-4 text-primary" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in-down">
            A.I. Astrologer
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8 animate-fade-in-up">
            Unlock the secrets of the cosmos. Get personalized astrological readings and chat with your AI-powered guide to the stars.
          </p>
          <Button
            onClick={handleSignIn}
            size="lg"
            className="animate-fade-in-up bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
             <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.383-7.572l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  const isChatDisabled = !user || (!isLoadingMessages && messages?.length === 0);
  
  return (
    <div className="flex flex-col h-full bg-background relative">
       <div 
        className="absolute inset-0 bg-repeat bg-center" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative flex flex-col h-full z-10">
        <ChatHeader />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages messages={displayMessages} />
        </main>
        <ChatInput onSendMessage={handleSendMessage} disabled={isChatDisabled} />
      </div>
    </div>
  );
}
