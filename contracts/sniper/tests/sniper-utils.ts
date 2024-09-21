import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  ZoneCompleted,
  ZoneCreated
} from "../generated/Sniper/Sniper"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createZoneCompletedEvent(
  user: Address,
  zoneId: BigInt,
  distractionScore: BigInt,
  productivityScore: BigInt,
  finalDuration: BigInt,
  attestationId: BigInt
): ZoneCompleted {
  let zoneCompletedEvent = changetype<ZoneCompleted>(newMockEvent())

  zoneCompletedEvent.parameters = new Array()

  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam("zoneId", ethereum.Value.fromUnsignedBigInt(zoneId))
  )
  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "distractionScore",
      ethereum.Value.fromUnsignedBigInt(distractionScore)
    )
  )
  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "productivityScore",
      ethereum.Value.fromUnsignedBigInt(productivityScore)
    )
  )
  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "finalDuration",
      ethereum.Value.fromUnsignedBigInt(finalDuration)
    )
  )
  zoneCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "attestationId",
      ethereum.Value.fromUnsignedBigInt(attestationId)
    )
  )

  return zoneCompletedEvent
}

export function createZoneCreatedEvent(
  user: Address,
  zoneId: BigInt,
  zone: ethereum.Tuple
): ZoneCreated {
  let zoneCreatedEvent = changetype<ZoneCreated>(newMockEvent())

  zoneCreatedEvent.parameters = new Array()

  zoneCreatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  zoneCreatedEvent.parameters.push(
    new ethereum.EventParam("zoneId", ethereum.Value.fromUnsignedBigInt(zoneId))
  )
  zoneCreatedEvent.parameters.push(
    new ethereum.EventParam("zone", ethereum.Value.fromTuple(zone))
  )

  return zoneCreatedEvent
}
