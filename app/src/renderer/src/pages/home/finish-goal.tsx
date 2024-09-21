import { DialogTitle } from '@radix-ui/react-dialog'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { getUserLastestZone } from '@renderer/graph'
import { useToast } from '@renderer/hooks/use-toast'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { finishGoal, getCalculateGoal, GoalsQueryEnum } from '@renderer/services'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PauseIcon } from 'lucide-react'
import { useState } from 'react'

export default function FinishGoal({
  goalId,
  refetch,
  ifpsCid
}: {
  goalId: string
  refetch: () => void
  ifpsCid: string
}) {
  const [open, setOpen] = useState(false)
  const [isFinishPending, setIsFinishPending] = useState(false)
  const { toast } = useToast()
  const wallet = useConnectedWallet()

  const { sniperContract } = useWeb3Content((state) => ({
    sniperContract: state.snipertContract
  }))

  const { data: caculateResult } = useQuery({
    queryKey: [GoalsQueryEnum.GOAL_CACULATE, goalId],
    queryFn: () => getCalculateGoal({ goalId }) as any,
    enabled: goalId !== '' && open
  })

  const finishMutate = useMutation({
    mutationKey: [GoalsQueryEnum.FINISH],
    mutationFn: finishGoal,
    onSuccess() {
      setIsFinishPending(false)
      setOpen(false)
      refetch()
    },
    onMutate() {
      setIsFinishPending(true)
    },
    onSettled() {
      setIsFinishPending(false)
    }
  })

  const handleFinishGoal = async () => {
    setIsFinishPending(true)
    const zone = await getUserLastestZone(wallet?.address!)
    const zoneId = zone.zoneId
    console.log('zoneId', zone, zoneId)
    // 停止截图
    // client.stopScreenshotTask()
    if (!zoneId) {
      toast({
        title: 'Something is wrong. Please try again.',
        description: 'Please try again.',
        variant: 'destructive'
      })
      return
    }
    // 更新数据库
    await finishMutate.mutateAsync({ goalId, zoneId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm">
          <PauseIcon className="mr-2 h-4 w-4" /> Finish Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Productivity Report</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-600 flex flex-col gap-2">
          <div>
            Average productivity score:
            <span className="text-large font-mono text-black ml-2">
              {caculateResult?.averageProductivityScore}
            </span>
          </div>
          <div>
            Number of distractions:
            <span className="text-large font-mono text-black ml-2">
              {caculateResult?.distractionCount}
            </span>
          </div>
          <div>
            Spend times (minutes):
            <span className="text-large font-mono text-black ml-2">{caculateResult?.duration}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isFinishPending} onClick={handleFinishGoal}>
            Finish Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
