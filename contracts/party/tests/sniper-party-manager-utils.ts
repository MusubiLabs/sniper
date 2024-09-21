import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  PartyCreated,
  PartyJoined,
  PartySponsored
} from "../generated/SniperPartyManager/SniperPartyManager"

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

export function createPartyCreatedEvent(
  creator: Address,
  maciInstance: Address,
  partyId: BigInt,
  pollId: BigInt,
  sniperPartyCredit: Address,
  endTime: BigInt,
  votingEndTime: BigInt
): PartyCreated {
  let partyCreatedEvent = changetype<PartyCreated>(newMockEvent())

  partyCreatedEvent.parameters = new Array()

  partyCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maciInstance",
      ethereum.Value.fromAddress(maciInstance)
    )
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "partyId",
      ethereum.Value.fromUnsignedBigInt(partyId)
    )
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam("pollId", ethereum.Value.fromUnsignedBigInt(pollId))
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "sniperPartyCredit",
      ethereum.Value.fromAddress(sniperPartyCredit)
    )
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )
  partyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "votingEndTime",
      ethereum.Value.fromUnsignedBigInt(votingEndTime)
    )
  )

  return partyCreatedEvent
}

export function createPartyJoinedEvent(
  user: Address,
  partyId: BigInt,
  zoneId: BigInt
): PartyJoined {
  let partyJoinedEvent = changetype<PartyJoined>(newMockEvent())

  partyJoinedEvent.parameters = new Array()

  partyJoinedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  partyJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "partyId",
      ethereum.Value.fromUnsignedBigInt(partyId)
    )
  )
  partyJoinedEvent.parameters.push(
    new ethereum.EventParam("zoneId", ethereum.Value.fromUnsignedBigInt(zoneId))
  )

  return partyJoinedEvent
}

export function createPartySponsoredEvent(
  user: Address,
  amount: BigInt,
  partyCoinsReceived: BigInt
): PartySponsored {
  let partySponsoredEvent = changetype<PartySponsored>(newMockEvent())

  partySponsoredEvent.parameters = new Array()

  partySponsoredEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  partySponsoredEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  partySponsoredEvent.parameters.push(
    new ethereum.EventParam(
      "partyCoinsReceived",
      ethereum.Value.fromUnsignedBigInt(partyCoinsReceived)
    )
  )

  return partySponsoredEvent
}
