import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { VoteService } from '@renderer/lib/vote'
import { getClaimData } from '@renderer/services'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Clock, Loader2, VoteIcon, Zap } from 'lucide-react'
import { useState } from 'react'

export default function VoteItem(props: { key: any; data: any; index: number }) {
  const { data, index } = props

  const wallet = useConnectedWallet()
  const [open, setOpen] = useState(false)
  const [summarize, setSummarize] = useState('')

  const voteService = useWeb3Content((state) => state.voteService) as VoteService
  const snipertContract = useWeb3Content((state) => state.snipertContract)
  const partyContract = useWeb3Content((state) => state.sniperPartyManager)
  console.log('data', data, index)

  const { zone, party, finalizedData } = data

  const voteMutate = useMutation({
    mutationKey: ['vote'],
    mutationFn: async () => {
      await voteService.vote(
        party.partyId,
        party.blockNumber,
        party.maciInstance,
        party.pollId,
        BigInt(index)
      )
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

  const ipfsMutate = useMutation({
    mutationKey: ['ipfs'],
    mutationFn: async () => {
      setSummarize('')
      const atData = (await snipertContract?.getCompletedAttestation(
        BigInt(zone.zoneId)
      )) as any
      console.log(`https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${atData[4]}`)
      const req = await fetch(`https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${atData[4]}`)
      const data = await req?.json()
      setSummarize(data.summarize)
    },
    onSuccess: () => {
      console.log('success')
    },
    onError() {
      console.log('error')
    },
    onSettled() {
      console.log('settled')
    }
  })

  const claimMutate = useMutation({
    mutationKey: ['claim'],
    mutationFn: async () => {
      const claimData = (await getClaimData({
        partyId: data?.partyId,
        recipientIndex: index,
        recipientTreeDepth: 2
      })) as any

      console.log('claim params: ', [
        BigInt(data?.partyId),
        BigInt(claimData?.[0]),
        BigInt(claimData?.[1]),
        claimData?.[2]?.map((item: any) => {
          return item?.map((item: any) => BigInt(item))
        }),
        BigInt(claimData?.[3]),
        BigInt(claimData?.[4]),
        BigInt(claimData?.[5])
      ])

      const hash = await partyContract?.claimFunds(
        BigInt(data?.partyId),
        BigInt(claimData?.[0]),
        BigInt(claimData?.[1]),
        claimData?.[2]?.map((item: any) => {
          return item?.map((item: any) => BigInt(item))
        }),
        BigInt(claimData?.[3]),
        BigInt(claimData?.[4]),
        BigInt(claimData?.[5])
      )

      await partyContract?.publicClient.waitForTransactionReceipt({ hash })
    },
    onSuccess: () => {
      console.log('success')
    },
    onError() {
      console.log('error')
    },
    onSettled() {
      console.log('settled')
    }
  })

  console.log(123131313, data)

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
            <span>
              Duration: {Math.floor(zone?.finalDuration / 60)} minutes{' '}
              {Math.floor(zone?.finalDuration % 60)} seconds{' '}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Distraction times: {zone?.distractionScore}</span>
          </div>
          {data?.vote ? (
            <div className="flex items-center space-x-2">
              <VoteIcon className="h-5 w-5 text-yellow-500" />
              <span>Vote count: {data?.vote}</span>
            </div>
          ) : null}
          <div className="text-sm text-gray-500">
            Completed on: {new Date(Number(zone?.blockTimestamp)).toLocaleDateString()}{' '}
            {new Date(Number(zone?.blockTimestamp)).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {/* TODO: currentUserAddress === zone.user, claim */}
        {finalizedData?._totalSpent &&
          data?.zone?.user?.toLowerCase() === wallet?.address?.toLowerCase() && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  console.log(12312313)
                  claimMutate.mutate()
                }}
              >
                Claim
              </Button>
            </div>
          )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button onClick={() => ipfsMutate.mutate()}>Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Vote option {index} details
              <div className="mt-8">summarize: {summarize}</div>
            </DialogTitle>

            <DialogFooter>
              {!finalizedData?._totalSpent && (
                <div className="flex gap-2">
                  <Button variant="secondary">Cancel</Button>
                  <Button onClick={() => voteMutate.mutate()} disabled={voteMutate.isPending}>
                    {voteMutate.isPending ? <Loader2 className="animate-spin" /> : 'Vote it!'}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
