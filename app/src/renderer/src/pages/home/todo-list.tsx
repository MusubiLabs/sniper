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
import { SniperContract } from '@renderer/lib/sniper'
import { pinata } from '@renderer/lib/pinataClient'
import { createGoal, getUnfinishedGoals, GoalsQueryEnum } from '@renderer/services'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import StartGoal from './start-goal'

interface Todo {
  id: number
  title: string
  description: string
  duration: number
  isStarted: boolean
  isCompleted: boolean
}

// 定义表单模式
const formSchema = z.object({
  name: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  duration: z.number().min(1, '时长必须大于0')
})

type FormValues = z.infer<typeof formSchema>

export default function TODO({ sniperContract }: { sniperContract: SniperContract | null }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const wallet = useConnectedWallet()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    // @rendererts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 0
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
      form.reset()
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('start upload', values)

    const ipfsResult = await pinata.upload.json({
      name: values.name,
      description: values?.description || '',
      duration: Number(values.duration)
    })

    if (!ipfsResult.cid) {
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
      goalIpfsCid: ipfsResult.cid
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
            <DialogTitle>添加新任务</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入任务标题" {...field} />
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="输入任务描述" {...field} />
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
                    <FormLabel>预计用时（分钟）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createGoalMutate.isPending}>
                添加任务
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
                  <p className="text-sm">Estimated time: {todo.duration} minutes</p>
                </div>
                <div className="space-y-2 self-center">
                  <StartGoal sniperContract={sniperContract} refetch={refetch} data={todo} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
