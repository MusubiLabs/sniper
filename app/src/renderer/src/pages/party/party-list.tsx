import { getPartyCreateds } from '@renderer/graph'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { getAllParties } from '@renderer/services'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import PartyItem from './party-item'

export default function PartyList() {
  const wallet = useConnectedWallet()
  const { data: onChainParties } = useQuery({
    queryKey: ['GET_CREATES_QUEYR'],
    async queryFn() {
      return getPartyCreateds()
    }
  })

  const { data: dbParties } = useQuery({
    queryKey: ['GET_DATABASE_PARTYS'],
    queryFn: getAllParties
  })

  console.log('party', onChainParties, dbParties)

  const renderData = useMemo(() => {
    return dbParties?.map((ele) => {
      const onChainData = onChainParties?.partyCreateds?.find(
        (e) => e.transactionHash === ele.transactionHash
      )

      return {
        ...ele,
        onChainData,
        isCreator: wallet?.address?.toLowerCase() === onChainData?.creator?.toLowerCase()
      }
    })
  }, [dbParties, onChainParties, wallet])

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderData?.map((e) => <PartyItem key={e.id} data={e} />)}
    </div>
  )
}
