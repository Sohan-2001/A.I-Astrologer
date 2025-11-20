

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { collection, addDoc, setDoc, doc } from "firebase/firestore"
import { getPrediction, GetPredictionOutput } from "@/ai/flows/get-prediction"

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a date in YYYY-MM-DD format.",
  }),
  birthTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format.",
  }),
  birthCity: z.string().min(2, {
    message: "Birth city must be at least 2 characters.",
  }),
})

interface BirthDetailsFormProps {
  onPrediction: (prediction: GetPredictionOutput) => void;
}

export function BirthDetailsForm({ onPrediction }: BirthDetailsFormProps) {
  const { toast } = useToast()
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let currentUser = user;

    if (!currentUser && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
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
        return;
      }
    }

    if (currentUser && firestore) {
      try {
        const birthDetailsCollection = collection(firestore, 'users', currentUser.uid, 'birthDetails');
        await addDoc(birthDetailsCollection, {
          ...data,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
        
        toast({
          title: "Details Submitted!",
          description: "The stars are aligning...",
        });

        // Pass the form data directly to the onPrediction handler
        onPrediction(data);

      } catch (error) {
        console.error("Firestore or Prediction error:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not save details or get prediction.",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4 font-serif">
          To begin, please provide your birth details.
        </p>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input placeholder="YYYY-MM-DD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time of birth</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM (24-hour)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthCity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City of birth</FormLabel>              <FormControl>
                <Input placeholder="Your birth city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-semibold bg-red-800 text-yellow-400 hover:bg-red-900">Get my reading</Button>
      </form>
    </Form>
  )
}
