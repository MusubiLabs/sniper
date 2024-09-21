import { DialogTitle } from '@radix-ui/react-dialog'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { client } from '@renderer/lib/client'
import { finishGoal, getCalculateGoal, GoalsQueryEnum } from '@renderer/services'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PauseIcon } from 'lucide-react'
import { useState } from 'react'

export default function FinishGoal({ goalId, refetch }: { goalId: string; refetch: () => void }) {
  const [open, setOpen] = useState(false)
  const [isFinishPending, setIsFinishPending] = useState(false)

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
    },
    onMutate() {
      setIsFinishPending(true)
    }
  })

  const handleFinishGoal = () => {
    setIsFinishPending(true)

    // 停止截图
    client.stopScreenshotTask()

    // 上传结果到链端

    // 更新数据库
    finishMutate.mutate({ goalId })
  }

  console.log('caculateResult', caculateResult)

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
