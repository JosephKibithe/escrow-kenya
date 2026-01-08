import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Deposited,
  DisputeRaised,
  DisputeResolved,
  ExcessTokensRecovered,
  FeeUpdated,
  FeeWalletUpdated,
  OwnershipTransferred,
  Paused,
  Refunded,
  Released,
  Unpaused
} from "../generated/AhadiEscrowFinal/AhadiEscrowFinal"

export function createDepositedEvent(
  dealId: BigInt,
  buyer: Address,
  seller: Address,
  amount: BigInt,
  timeoutInSeconds: BigInt
): Deposited {
  let depositedEvent = changetype<Deposited>(newMockEvent())

  depositedEvent.parameters = new Array()

  depositedEvent.parameters.push(
    new ethereum.EventParam("dealId", ethereum.Value.fromUnsignedBigInt(dealId))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam(
      "timeoutInSeconds",
      ethereum.Value.fromUnsignedBigInt(timeoutInSeconds)
    )
  )

  return depositedEvent
}

export function createDisputeRaisedEvent(
  dealId: BigInt,
  disputer: Address
): DisputeRaised {
  let disputeRaisedEvent = changetype<DisputeRaised>(newMockEvent())

  disputeRaisedEvent.parameters = new Array()

  disputeRaisedEvent.parameters.push(
    new ethereum.EventParam("dealId", ethereum.Value.fromUnsignedBigInt(dealId))
  )
  disputeRaisedEvent.parameters.push(
    new ethereum.EventParam("disputer", ethereum.Value.fromAddress(disputer))
  )

  return disputeRaisedEvent
}

export function createDisputeResolvedEvent(
  dealId: BigInt,
  winner: Address,
  amount: BigInt
): DisputeResolved {
  let disputeResolvedEvent = changetype<DisputeResolved>(newMockEvent())

  disputeResolvedEvent.parameters = new Array()

  disputeResolvedEvent.parameters.push(
    new ethereum.EventParam("dealId", ethereum.Value.fromUnsignedBigInt(dealId))
  )
  disputeResolvedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  disputeResolvedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return disputeResolvedEvent
}

export function createExcessTokensRecoveredEvent(
  token: Address,
  to: Address,
  amount: BigInt
): ExcessTokensRecovered {
  let excessTokensRecoveredEvent =
    changetype<ExcessTokensRecovered>(newMockEvent())

  excessTokensRecoveredEvent.parameters = new Array()

  excessTokensRecoveredEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  excessTokensRecoveredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  excessTokensRecoveredEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return excessTokensRecoveredEvent
}

export function createFeeUpdatedEvent(newFee: BigInt): FeeUpdated {
  let feeUpdatedEvent = changetype<FeeUpdated>(newMockEvent())

  feeUpdatedEvent.parameters = new Array()

  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return feeUpdatedEvent
}

export function createFeeWalletUpdatedEvent(
  newWallet: Address
): FeeWalletUpdated {
  let feeWalletUpdatedEvent = changetype<FeeWalletUpdated>(newMockEvent())

  feeWalletUpdatedEvent.parameters = new Array()

  feeWalletUpdatedEvent.parameters.push(
    new ethereum.EventParam("newWallet", ethereum.Value.fromAddress(newWallet))
  )

  return feeWalletUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

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

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRefundedEvent(
  dealId: BigInt,
  buyer: Address,
  amount: BigInt
): Refunded {
  let refundedEvent = changetype<Refunded>(newMockEvent())

  refundedEvent.parameters = new Array()

  refundedEvent.parameters.push(
    new ethereum.EventParam("dealId", ethereum.Value.fromUnsignedBigInt(dealId))
  )
  refundedEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  refundedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return refundedEvent
}

export function createReleasedEvent(
  dealId: BigInt,
  seller: Address,
  netAmount: BigInt,
  fee: BigInt
): Released {
  let releasedEvent = changetype<Released>(newMockEvent())

  releasedEvent.parameters = new Array()

  releasedEvent.parameters.push(
    new ethereum.EventParam("dealId", ethereum.Value.fromUnsignedBigInt(dealId))
  )
  releasedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  releasedEvent.parameters.push(
    new ethereum.EventParam(
      "netAmount",
      ethereum.Value.fromUnsignedBigInt(netAmount)
    )
  )
  releasedEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return releasedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
