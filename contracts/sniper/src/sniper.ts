import {
  OwnershipTransferred as OwnershipTransferredEvent,
  ZoneCompleted as ZoneCompletedEvent,
  ZoneCreated as ZoneCreatedEvent
} from "../generated/Sniper/Sniper"
import {
  OwnershipTransferred,
  ZoneCompleted,
  ZoneCreated
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

export function handleZoneCompleted(event: ZoneCompletedEvent): void {
  let entity = new ZoneCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.zoneId = event.params.zoneId
  entity.distractionScore = event.params.distractionScore
  entity.productivityScore = event.params.productivityScore
  entity.finalDuration = event.params.finalDuration
  entity.attestationId = event.params.attestationId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleZoneCreated(event: ZoneCreatedEvent): void {
  let entity = new ZoneCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.zoneId = event.params.zoneId
  entity.zone_ipfsHash = event.params.zone.ipfsHash
  entity.zone_startTime = event.params.zone.startTime
  entity.zone_duration = event.params.zone.duration
  entity.zone_completed = event.params.zone.completed
  entity.zone_attestationId = event.params.zone.attestationId
  entity.zone_mode = event.params.zone.mode

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
