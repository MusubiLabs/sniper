import {
  OwnershipTransferred as OwnershipTransferredEvent,
  PartyCreated as PartyCreatedEvent,
  PartyJoined as PartyJoinedEvent,
  PartySponsored as PartySponsoredEvent
} from "../generated/SniperPartyManager/SniperPartyManager"
import {
  OwnershipTransferred,
  PartyCreated,
  PartyJoined,
  PartySponsored
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartyCreated(event: PartyCreatedEvent): void {
  let entity = new PartyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.maciInstance = event.params.maciInstance
  entity.partyId = event.params.partyId
  entity.pollId = event.params.pollId
  entity.sniperPartyCredit = event.params.sniperPartyCredit
  entity.endTime = event.params.endTime
  entity.votingEndTime = event.params.votingEndTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartyJoined(event: PartyJoinedEvent): void {
  let entity = new PartyJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.partyId = event.params.partyId
  entity.zoneId = event.params.zoneId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartySponsored(event: PartySponsoredEvent): void {
  let entity = new PartySponsored(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.partyCoinsReceived = event.params.partyCoinsReceived

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
