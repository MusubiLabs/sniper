import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@renderer/components/ui/button'
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
import { pinata } from '@renderer/lib/pinataClient'
import { getSecondTimestamp } from '@renderer/lib/utils'
import { createParty } from '@renderer/services'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useMutation } from '@tanstack/react-query'
import { Loader2, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// 定义表单模式
const formSchema = z.object({
  name: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
  partyDuration: z.number().min(1, 'The duration must be greater than 0'),
  voteDuration: z.number().min(1, 'The duration must be greater than 0')
})

type FormValues = z.infer<typeof formSchema>

export default function PartyCreate() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { sniperPartyManager } = useWeb3Content((state) => ({
    sniperPartyManager: state.sniperPartyManager
  }))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Coding for 40 minutes and deploy the MVP on the blockchain testnet',
      description: 'Allow me to use IDEs to code and Notion to do documentation, and conduct research through browser activities(Claude3 ChatGPT). However, restrict access to unrelated videos or Twitter.',
      partyDuration: 5,
      voteDuration: 5
    }
  })

  const createPartyMutate = useMutation({
    mutationKey: ['CREATE_PARTY'],
    mutationFn: async (values: FormValues) => {
      const partyEndTime = getSecondTimestamp(values.partyDuration)
      const voteEndTime = getSecondTimestamp(values.partyDuration + values.voteDuration)

      const ipfsResult = await pinata.upload.json({
        name: values.name,
        description: values.description,
        partyEndTime,
        voteEndTime
      })

      console.log(
        'Create party params',
        BigInt(partyEndTime),
        BigInt(voteEndTime),
        ipfsResult.IpfsHash
      )

      const hash = await sniperPartyManager?.createParty(
        BigInt(partyEndTime),
        BigInt(voteEndTime),
        ipfsResult.IpfsHash
      )

      const receipt = await sniperPartyManager?.publicClient.waitForTransactionReceipt({ hash })

      console.log('database data:', {
        name: values.name,
        description: values.description!,
        transactionHash: receipt?.transactionHash as `0x${string}`,
        ipfsHash: ipfsResult.IpfsHash
      })

      await createParty({
        name: values.name,
        description: values.description!,
        transactionHash: receipt?.transactionHash as `0x${string}`,
        ipfsHash: ipfsResult.IpfsHash
      })
    },
    onSuccess() {
      form.reset()
      toast({
        title: 'Success',
        description: 'Party created successfully'
      })
    },
    onError() {
      toast({
        title: 'Error',
        description: 'Party creation failed, please try again'
      })
    },
    onSettled() {
      setOpen(false)
    }
  })

  async function onSubmit(values: FormValues) {
    await createPartyMutate.mutateAsync(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="flex items-center gap-2">
          <PlusIcon size={18} />
          Create a party
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input defaultValue='Coding for 40 minutes and deploy the MVP on the blockchain testnet' placeholder="Please enter title" {...field} />
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
                      <Textarea defaultValue='Allow me to use IDEs to code and Notion to do documentation, and conduct research through browser activities(Claude3 ChatGPT). However, restrict access to unrelated videos or Twitter.' placeholder="Please enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partyDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party duration (minutes)</FormLabel>
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
              <FormField
                control={form.control}
                name="voteDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vote duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        defaultValue={5}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <Button
          type="submit"
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={createPartyMutate.isPending}
        >
          {createPartyMutate.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Create new party'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
