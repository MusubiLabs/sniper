// export default ContributionGraph
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { getContributeData, GoalsQueryEnum } from '@renderer/services'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import ActivityCalendar from 'react-activity-calendar'

interface ContributionData {
  date: string
  score: number
  count: number
  level: number
}

const ContributionGraph: React.FC = () => {
  const wallet = useConnectedWallet()

  const { data } = useQuery({
    queryKey: [GoalsQueryEnum.CONTRIBUTE_DATA, wallet?.address],
    queryFn: async () => {
      const endDate = new Date()
      const startDate = new Date(endDate)
      startDate.setFullYear(startDate.getFullYear() - 1)
      startDate.setDate(startDate.getDate() - startDate.getDay()) // Start from Sunday

      return getContributeData({
        address: wallet?.address!,
        startDate: startDate.toString(),
        endDate: endDate.toString()
      }) as Promise<ContributionData[]>
    },
    enabled: !!wallet?.address
  })

  // 转换数据格式以适应 GitHubCalendar 组件
  const formattedData = React.useMemo(() => {
    if (!data) return []
    return data.map((item) => ({
      date: item.date,
      count: item.count,
      level: item.level
      // [item.date]: {
      //   level: item.level
      // }
    }))
  }, [data])

  if (!formattedData || !formattedData.length) {
    return null
  }

  return (
    <div className="w-full p-8 pb-0">
      <ActivityCalendar
        data={formattedData || []}
        style={{
          width: '100%'
        }}
        hideTotalCount={true}
        maxLevel={4}
        theme={{
          light: ['#e8eaee', '#a5e2a1', '#62b85e', '#4d9349', '#346135']
        }}
      />
    </div>
  )
}

export default ContributionGraph
