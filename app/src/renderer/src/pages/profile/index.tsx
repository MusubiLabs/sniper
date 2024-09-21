import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { useWeb3Content } from '@renderer/stores/web3-content'
import { useEffect, useState } from 'react'
import ContributionGraph from './contribution-graph'
import FinishedGoals from './finished-goals'

export default function Profile() {
  const [userPoint, setUserPoint] = useState(0)
  const wallet = useConnectedWallet()
  const { sniperCoinContract } = useWeb3Content((state) => ({
    sniperCoinContract: state.sniperCoinContract
  }))

  useEffect(() => {
    async function fetch() {
      if (!wallet || !sniperCoinContract) return

      try {
        const points = await sniperCoinContract?.getBalanceOf(wallet?.address)
        console.log('POINTS', points)
        setUserPoint(Number(points) || 0)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    fetch()
  }, [wallet, sniperCoinContract])

  console.log(wallet)

  return (
    <div>
      <div className="flex space-x-3 rounded-lg p-4 flex-col items-center">
        <Avatar className="size-16 bg-primary/30">
          <AvatarFallback className="text-2xl font-bold">
            {wallet?.address?.slice(-1)?.toUpperCase() || 'F'}
          </AvatarFallback>
        </Avatar>
        <div className="text font-medium leading-none mt-4">
          Points: <span className="text-blue-600 text-[20px]">{userPoint}</span>
        </div>
      </div>
      <ContributionGraph />
      <FinishedGoals />
    </div>
  )
}
