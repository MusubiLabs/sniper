// @ts-ignore
import { gql, request } from 'graphql-request'

const PARTY_CREATEDS_QUERY = gql`
  query MyQuery {
    partySponsoreds {
      amount
      blockTimestamp
      id
      partyCoinsReceived
      transactionHash
      user
      blockNumber
    }
    partyJoineds(orderBy: blockNumber, orderDirection: asc) {
      id
      partyId
      zoneId
      transactionHash
      user
      blockNumber
    }
    partyCreateds(orderBy: partyId, orderDirection: desc) {
      blockTimestamp
      blockNumber
      transactionHash
      creator
      endTime
      id
      maciInstance
      partyId
      partyToken
      pollId
      votingEndTime
    }
  }
`

const PARTY_JOINED_QUERY = gql`
  query GetJoinedParty($partyId: string) {
    partyJoineds(where:{partyId: $partyId},orderBy: blockNumber, orderDirection: asc) {
      id
      partyId
      zoneId
      transactionHash
      user
      blockNumber
    }
    partyCreateds(where:{partyId: $partyId}) {
      blockTimestamp
      blockNumber
      transactionHash
      creator
      endTime
      id
      maciInstance
      partyId
      partyToken
      pollId
      votingEndTime
    }
  }
`
const url = import.meta.env.VITE_PARTY_GRAPH_URL

// 获取所有已经创建的party
export function getPartyCreateds() {
  return request(url, PARTY_CREATEDS_QUERY)
}

export async function getJoinedParty(partyId: string) {
  return request(url, PARTY_JOINED_QUERY, { partyId })
}
