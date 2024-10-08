import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@renderer/components/ui/input'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { createGoal, GoalsQueryEnum } from '@renderer/services'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PartyItem(props: { data: any, }) {
  const { data } = props
  const navigate = useNavigate()

  const wallet = useConnectedWallet()
  const sniperPartyManager = useWeb3Content((state) => state.sniperPartyManager)
  const usdcContract = useWeb3Content((state) => state.usdcContract)

  const [open, setOpen] = useState(false)
  const [sponsorAmount, setSponsorAmount] = useState(0)

  console.log('data', data)

  const sponsorMutate = useMutation({
    mutationKey: ['sponsor'],
    mutationFn: async () => {
      const sponsorAmountWithDecimal = BigInt(sponsorAmount * 10 ** 6)
      const partyId = data?.partyData?.partyId
      console.log(partyId, usdcContract, sponsorAmountWithDecimal)
      const allowance = (await usdcContract?.getAllowance(
        import.meta.env.VITE_SNIPER_PARTY_MANAGER
      )) as bigint
      console.log('allowance', allowance)
      if (allowance < sponsorAmountWithDecimal) {
        const approveTx = await usdcContract?.approve(
          import.meta.env.VITE_SNIPER_PARTY_MANAGER,
          sponsorAmountWithDecimal
        )
        console.log(approveTx)
      }
      const hash = await sniperPartyManager?.sponsorParty(BigInt(partyId), sponsorAmountWithDecimal)

      console.log(hash)

      const re = await sniperPartyManager?.publicClient?.waitForTransactionReceipt({ hash })
      console.log(re)

      return re
    },
    onSuccess: () => {
      setOpen(false)
      setSponsorAmount(0)
    },
    onError() {
      console.log('error')
    },
    onSettled() {
      console.log('settled')
    }
  })

  const createGoalMutate = useMutation({
    mutationKey: [GoalsQueryEnum.CREATE],
    mutationFn: createGoal,
    onSuccess() {
      console.log('Goal Creation Success')
    },
    onError() {
      console.log('Goal Creation Failed')
    },
    onSettled() {
      console.log('Goal Creation settled')
    }
  })

  const joinMutate = useMutation({
    mutationKey: ['join'],
    mutationFn: async () => {
      const partyId = data?.onChainData?.partyId

      const hash = await sniperPartyManager?.joinParty(BigInt(partyId))

      console.log(hash)

      const re = (await sniperPartyManager?.publicClient?.waitForTransactionReceipt({ hash })) as any
      console.log(re)

      if (re.status !== 'success') {
        console.log('join party failed')
        return
      }

      await createGoalMutate.mutateAsync({
        name: data.name,
        description: data?.description || '',
        duration: Number(data?.onChainData?.endTime - data?.onChainData?.blockTimestamp),
        address: wallet?.address!,
        goalIpfsCid: data.IpfsHash,
        mode: 1
      })
      navigate('/')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* <div className="text-sm">Creator: 0xDcdF9e3D240bD0eAf5Fa19b33BA74d279eA4936c</div> */}
        <div className="text-sm">Creator: {data?.partyData?.creator}</div>
        <div className="text-sm">Party Time:</div>
        <TimeTracker startedAt={0} endAt={Number(data?.partyData?.endTime) * 1000} reverse={true} />
        <div className="text-sm">Voting Time:</div>
        <TimeTracker
          startedAt={0}
          endAt={Number(data?.partyData?.votingEndTime) * 1000}
          reverse={true}
        />
        <div className="text-sm">
          Sponsored Funds: {data?.sponsoredData ? data?.sponsoredData?.amount / 10 ** 6 : 0} USDC
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {(data?.onChainData?.endTime < Date.now() && data?.onChainData?.voteEndTime > Date.now()) && (<Button onClick={() => navigate('/vote/' + '1231313')}>Vote</Button>)}
        {data?.onChainData?.endTime > Date.now() && (
          <Button onClick={() => joinMutate.mutate()}>Join</Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
          {data?.onChainData?.endTime > Date.now() && (<Button>Sponsor ($)</Button>)}
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Sponsor</DialogTitle>
            <div className="mt-8">
              <Input
                value={sponsorAmount}
                onChange={(e) => setSponsorAmount(Number(e.target.value))}
                placeholder="Please input your sponsor amount (USDC)"
                min={4}
              ></Input>
            </div>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button onClick={() => sponsorMutate.mutate()} disabled={sponsorMutate.isPending}>
                {sponsorMutate.isPending ? <Loader2 className="animate-spin" /> : 'Sponsor ($USDC)'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardFooter>
    </Card>
  )
}
