import request from '../../lib/request'

export enum PartyQueryEnum {}

export function createParty(data: {
  name: string
  description: string
  transactionHash: string
  ipfsHash: string
}) {
  return request('/api/party/create', {
    data
  })
}

export function getAllParties(data: {}) {
  return request<any>('/api/party/all', {
    data
  })
}
