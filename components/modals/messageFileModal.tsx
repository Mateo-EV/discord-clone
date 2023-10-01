"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"
import axios from "axios"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FieldUpload } from "../FieldUpload"
import { useModal } from "@/hooks/useModalStore"

const messageFileSchema = z.object({
  fileURL: z.string().min(1, "File is required")
})

type messageFileSchema = z.infer<typeof messageFileSchema>

export const MessageFileModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { apiUrl, query }
  } = useModal()
  const router = useRouter()

  const isModalOpen = isOpen && type === "messageFile"

  const form = useForm<messageFileSchema>({
    resolver: zodResolver(messageFileSchema),
    defaultValues: {
      fileURL: ""
    }
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isLoading = form.formState.isSubmitting
  const onSubmit: SubmitHandler<messageFileSchema> = async values => {
    try {
      let url = `${apiUrl}?`
      for (const prop in query) {
        url += `${prop}=${query[prop]}&`
      }
      await axios.post(url.slice(0, -1), {
        fileUrl: values.fileURL,
        content: values.fileURL
      })

      form.reset()
      router.refresh()
      handleClose()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription>Send a file as a message</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FieldUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring text-black focus-visible:ring-offset-0"
                        placeholder="Enter server name..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
