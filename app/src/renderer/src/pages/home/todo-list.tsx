import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { useToast } from '@renderer/hooks/use-toast'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { pinata } from '@renderer/lib/pinataClient'
import { createGoal, getUnfinishedGoals, GoalsQueryEnum } from '@renderer/services'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import StartGoal from './start-goal'

// 定义表单模式
const formSchema = z.object({
  name: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
  duration: z.number().min(1, 'The duration must be greater than 0')
})

type FormValues = z.infer<typeof formSchema>

export default function TODO() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useConnectedWallet()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Coding for 40 minutes and deploy the MVP on the blockchain testnet',
      description: 'Allow me to use IDEs to code and Notion to do documentation, and conduct research through browser activities(Claude3 ChatGPT). However, restrict access to unrelated videos or Twitter.',
      duration: 5
    }
  })

  const { data, refetch } = useQuery({
    queryKey: [GoalsQueryEnum.UNFINISHED, wallet?.address],
    queryFn: () => {
      const result = getUnfinishedGoals({ address: wallet?.address! })

      return result
    },
    enabled: !!wallet?.address
  })

  const createGoalMutate = useMutation({
    mutationKey: [GoalsQueryEnum.CREATE],
    mutationFn: createGoal,
    onSuccess() {
      refetch()
      toast({
        title: 'Goal Created!'
      })
    },
    onError() {
      console.log('Goal Creation Failed')
    },
    onSettled() {
      setIsDialogOpen(false)
      setIsLoading(false)
      form.reset()
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const ipfsResult = await pinata.upload.json({
      name: values.name,
      description: values?.description || '',
      duration: Number(values.duration)
    })

    console.log('ipfsResult', ipfsResult)

    if (!ipfsResult.IpfsHash) {
      setIsLoading(false)

      toast({
        title: 'Upload Failed',
        description: 'IPFS upload failed',
        variant: 'destructive'
      })

      return
    }

    // 在链上创建任务 goal description
    await createGoalMutate.mutateAsync({
      name: values.name,
      description: values?.description || '',
      duration: Number(values.duration),
      address: wallet?.address!,
      goalIpfsCid: ipfsResult.IpfsHash,
      mode: 0
    })
  }

  return (
    <div className="p-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="size-10 fixed bottom-6 right-6 rounded-full" size="icon">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new Goal</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Please enter title" defaultValue='Coding for 40 minutes and deploy the MVP on the blockchain testnet' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please enter description" defaultValue='Allow me to use IDEs to code and Notion to do documentation, and conduct research through browser activities(Claude3 ChatGPT). However, restrict access to unrelated videos or Twitter.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated usage duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        defaultValue={5}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) * 60)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    loading ...
                  </>
                ) : (
                  'Add goal'
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="w-full flex flex-col gap-4">
        {(data as any)?.map((todo: any) => (
          <Card key={todo.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium">{todo.name}</h3>
                  <p className="text-sm text-muted-foreground">{todo.description}</p>
                  <p className="text-sm">Estimated time: {Math.floor(todo.duration / 60)} minutes {todo.duration % 60} seconds</p>
                </div>
                <div className="space-y-2 self-center">
                  <StartGoal refetch={refetch} data={todo} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
