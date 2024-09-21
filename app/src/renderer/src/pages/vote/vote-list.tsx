import { getAllZones, getPartyCreateds } from '@renderer/graph'
import { useConnectedWallet } from '@renderer/hooks/useConnectedWallet'
import { getVoteResult } from '@renderer/services'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import VoteItem from './vote-item'

export default function VoteList(props: { data: any }) {
  const { data } = props
  const wallet = useConnectedWallet()
  const partyId = data.id
  const { data: onChainParties } = useQuery({
    queryKey: ['GET_JOINED_QUERY'],
    queryFn: async () => getPartyCreateds(),
    select: (data) => {
      return {
        partyJoineds: data.partyJoineds.filter((party) => party.partyId == partyId),
        party: data.partyCreateds.filter((party) => party.partyId == partyId)[0],
        finalizeds: data.partyFinalizeds
      }
    }
  })

  const { data: onChainZone } = useQuery({
    queryKey: ['GET_ALL_ZONE'],
    async queryFn() {
      return getAllZones()
    }
  })

  const { data: voteResult } = useQuery({
    queryKey: ['GET_VOTE_DATA'],
    queryFn: async () => (await getVoteResult({ partyId })) as any,
    enabled: !!partyId
  })

  console.log('vote', onChainParties, onChainZone, voteResult)

  const renderData = useMemo(() => {
    return onChainParties?.partyJoineds
      ?.map((ele, index) => {
        const zone = onChainZone?.zoneCompleteds?.find(
          (e) => e.zoneId === ele.zoneId && e.user === ele.user
        )
        const finalizedData = onChainParties?.finalizeds?.find((e) => e.partyId === ele?.partyId)
        const userVoteResult = voteResult?.results?.tally?.[index]
        return {
          ...ele,
          zone,
          finalizedData,
          party: onChainParties.party,
          vote: userVoteResult,
          maci: voteResult
        }
      })
      .filter((party) => party.partyId == partyId)
  }, [onChainZone, onChainParties, wallet, voteResult])

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {renderData?.map((e, i) => <VoteItem key={e.id} data={e} index={i} />)}
    </div>
  )
}
