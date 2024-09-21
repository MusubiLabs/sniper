import { Badge } from '@renderer/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { getFinishedGoalsdata, GoalsQueryEnum } from '@renderer/services'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, Zap } from 'lucide-react'

export default function FinishedGoals() {
  const wallet = useConnectedWallet()

  const { data: goals } = useQuery({
    queryKey: [GoalsQueryEnum.GET_FINISH_GOALS, wallet?.address],
    queryFn: () => getFinishedGoalsdata({ address: wallet?.address! }) as unknown as any[],
    enabled: !!wallet?.address
  })

  return (
    <div className="w-full flex flex-col p-8 gap-4">
      {goals?.map((goal) => (
        <Card className="w-full" key={goal.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{goal.name}</span>
              <Badge className="ml-2">Completed</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{goal.description}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Duration: {goal?.result?.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Average Productivity Score: {goal.result?.averageProductivityScore}</span>
              </div>
              <div className="text-sm text-gray-500">
                Completed on: {new Date(goal.finishedAt).toLocaleDateString()}{' '}
                {new Date(goal.finishedAt).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
