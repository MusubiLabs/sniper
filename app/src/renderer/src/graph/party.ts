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
    partyJoineds {
      id
      partyId
      zoneId
      transactionHash
      user
    }
    partyCreateds(orderBy: partyId, orderDirection: desc) {
      blockTimestamp
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
    partySponsoreds(orderBy: partyId, orderDirection: desc) {
      id
      partyId
      partyCoinsReceived
    }
    partyFinalizeds(orderBy: partyId, orderDirection: desc) {
      id
      partyId
      finalizer
      _totalSpent
      _totalSpentSalt
      _newResultCommitment
      _perVOSpentVoiceCreditsHash
      blockNumber
      blockTimestamp
    }
  }
`

const PARTY_JOINED_QUERY = gql`
  query GetJoinedParty($partyId: string) {
    partyJoineds(where: { partyId: $partyId }, orderBy: blockNumber, orderDirection: asc) {
      id
      partyId
      sessionId
      transactionHash
      user
      blockNumber
    }
    partyCreateds(where: { partyId: $partyId }) {
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
    partySponsoreds(where: { partyId: $partyId }) {
      id
      partyId
      partyCoinsReceived
    }
  }
`

const PARTY_USER_REWARDS_QUERY = gql`
  query MyQuery($user: String!) {
    partyRewardClaimeds(where: { user: $user }) {
      amount
      blockNumber
      blockTimestamp
      claimedToken
      id
      partyId
      transactionHash
      user
    }
  }
`

const url = import.meta.env.VITE_PARTY_GRAPH_URL

// 获取所有已经创建的party
export function getPartyCreateds() {
  return request(url, PARTY_CREATEDS_QUERY)
}
