import { getPartyCreateds, getAllZones, getJoinedParty } from '@renderer/graph'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import VoteItem from './vote-item'

export default function VoteList(props: { data: any, }) {
  const { data } = props
  const wallet = useConnectedWallet()
  const partyId = data.id
  const { data: onChainParties } = useQuery({
    queryKey: ['GET_JOINED_QUERY'],
    queryFn: async () => getPartyCreateds(),
    select: (data) => {
      return {
        partyJoineds: data.partyJoineds.filter((party) => party.partyId == partyId),
        party: data.partyCreateds.filter((party) => party.partyId == partyId)[0]
      }
    }
  })

  const { data: onChainZone } = useQuery({
    queryKey: ['GET_ALL_ZONE'],
    async queryFn() {
      return getAllZones()
    }
  })

  console.log('vote', onChainParties, onChainZone)

  const renderData = useMemo(() => {
    return onChainParties?.partyJoineds?.map((ele) => {
      const zone = onChainZone?.zoneCompleteds?.find(
        (e) => e.zoneId === ele.zoneId && e.user === ele.user
      )

      return {
        ...ele,
        zone,
        party: onChainParties.party
      }
    }).filter((party) => party.partyId == partyId)
  }, [onChainZone, onChainParties, wallet])

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderData?.map((e, i) => <VoteItem key={e.id} data={e} index={i} />)}
    </div>
  )
}
