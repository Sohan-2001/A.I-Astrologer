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

export function BirthDetailsForm() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Details Submitted!",
      description: "The stars are aligning...",
    })
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-card-foreground mb-4">
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
              <FormLabel>City of birth</FormLabel>
              <FormControl>
                <Input placeholder="Your birth city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Get my reading</Button>
      </form>
    </Form>
  )
}
