import { TimeTracker } from '@renderer/components/time-traker'
import { Button } from '@renderer/components/ui/button'
import { useToast } from '@renderer/hooks/use-toast'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { client } from '@renderer/lib/client'
import { SniperContract } from '@renderer/lib/sniper'
import { fetchStartGoal, GoalsQueryEnum } from '@renderer/services'
import { useMutation } from '@tanstack/react-query'
import { Loader2, PlayIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import FinishGoal from './finish-goal'

export default function StartGoal({
  data,
  refetch,
  sniperContract
}: {
  data: any
  refetch: () => void
  sniperContract: SniperContract | null
}) {
  const [isStarting, setIsStarting] = useState(false)

  const wallet = useConnectedWallet()
  const { toast } = useToast()
  const { id: goalId, isStarted, goalIpfsCid, duration } = data

  useEffect(() => {
    window.electron.ipcRenderer.on('screenshot-taken', (event, screenshot) => {
      console.log(event, screenshot)
    })
  }, [])

  const startGoalMutate = useMutation({
    mutationKey: [GoalsQueryEnum.START],
    mutationFn: fetchStartGoal,
    onSuccess() {
      refetch()
      client.startScreenshotTask({
        goalId: goalId,
        address: wallet?.address!
      })
    },
    onError(error) {
      console.log('error', error)
    }
  })

  const startGoal = async () => {
    try {
      if (!wallet?.address || !goalId || !sniperContract) {
        toast({
          title: 'Something is wrong. Please try again.',
          variant: 'destructive'
        })

        return
      }

      const startDate = new Date()

      setIsStarting(true)

      // TODO 链上创建记录
      // const session = await sniperContract.createSniperSession(
      //   goalIpfsCid,
      //   BigInt(Date.now()),
      //   BigInt(duration * 60 * 1000)
      // )

      // console.log('session', session)

      await startGoalMutate.mutateAsync({
        address: wallet?.address,
        goalId: goalId,
        sessionId: '123123131313131231',
        startedAt: startDate.toString()
      })
    } catch {
    } finally {
    }
  }

  return (
    <>
      {!isStarted && (
        <Button size="sm" onClick={startGoal} disabled={isStarting}>
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" /> Start
            </>
          )}
        </Button>
      )}
      {isStarted && (
        <div className="flex flex-col items-center gap-2">
          <FinishGoal goalId={goalId} refetch={refetch} />
          <TimeTracker startedAt={data.startedAt} />
        </div>
      )}
    </>
  )
}
