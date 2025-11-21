
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const FormSchema = z.object({
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
})

interface FeedbackFormProps {
  onSubmit: () => void;
}

export function FeedbackForm({ onSubmit: onFormSubmit }: FeedbackFormProps) {
  const { toast } = useToast()
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      feedback: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
      });
      return;
    }

    try {
      const feedbackCollection = collection(firestore, 'feedbacks');
      await addDoc(feedbackCollection, {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback.",
      });
      
      onFormSubmit();

    } catch (error) {
      console.error("Feedback submission error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not submit your feedback. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think..."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </Form>
  )
}

    