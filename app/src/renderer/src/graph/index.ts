// @ts-ignore
import { gql, request } from 'graphql-request'
// TODO: 基于User查询
const query = gql`
  {
    zoneCompleteds {
      id
      user
      zoneId
      distractionScore
    }
    zoneCreateds {
      id
      user
      zoneId
      zone_ipfsHash
      zone_duration
      zone_startTime
    }
  }
`
const GET_LATEST_ZONE = gql`
  query GetLatestZone($user: String!) {
    zoneCreateds(where: { user: $user }, orderBy: zoneId, orderDirection: desc, first: 1) {
      id
      user
      zoneId
      zone_ipfsHash
      zone_duration
      zone_startTime
    }
  }
`
const url = 'https://api.studio.thegraph.com/query/88909/fffocu/version/latest'
export async function getAllZones() {
  return await request(url, query)
}
export async function getUserLastestZone(user: string) {
  const arr = await request(url, GET_LATEST_ZONE, { user })
  return arr?.zoneCreateds?.[0]
}