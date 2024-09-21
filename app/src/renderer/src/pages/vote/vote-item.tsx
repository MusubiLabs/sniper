import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { VoteService } from '@renderer/lib/vote'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Clock, Loader2, Zap } from 'lucide-react'
import { useState } from 'react'

export default function VoteItem(props: { key: any, data: any, index: number }) {
  const { data, index } = props

  const [open, setOpen] = useState(false)

  const voteService = useWeb3Content((state) => state.voteService) as VoteService

  console.log('data', data, index)

  const { zone, party } = data

  const voteMutate = useMutation({
    mutationKey: ['vote'],
    mutationFn: async () => {
      await voteService.vote(party.partyId, party.blockNumber, party.maciInstance, party.pollId, BigInt(index))
    },
    onSuccess: () => {
      setOpen(false)
    },
    onError() {
      console.log('error')
    },
    onSettled() {
      console.log('settled')
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.user}</CardTitle>
      </CardHeader>
      <CardContent>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Average Productivity Score: {zone?.productivityScore / 1000}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Duration: {Math.floor(zone?.finalDuration / 60)} minutes {Math.floor(zone?.finalDuration % 60)} seconds </span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Distraction times: {zone?.distractionScore}</span>
          </div>
          <div className="text-sm text-gray-500">
            Completed on: {new Date(Number(zone?.blockTimestamp)).toLocaleDateString()}{' '}
            {new Date(Number(zone?.blockTimestamp)).toLocaleTimeString()}
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Vote option details</DialogTitle>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button onClick={() => voteMutate.mutate()} disabled={voteMutate.isPending}>
                {voteMutate.isPending ? <Loader2 className="animate-spin" /> : 'Vote it!'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardFooter>
    </Card>
  )
}
