import { useEffect, useState } from 'react'

export const TimeTracker = ({ startedAt }) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const startTime = new Date(startedAt).getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const elapsed = now - startTime
      setElapsedTime(elapsed)
    }, 1000) // 每秒更新一次

    return () => clearInterval(timer) // 清理定时器
  }, [startedAt])

  // 将毫秒转换为时分秒格式
  const formatTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)

    seconds = seconds % 60
    minutes = minutes % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return <div className="text-sm text-gray-600">{formatTime(elapsedTime)}</div>
}
