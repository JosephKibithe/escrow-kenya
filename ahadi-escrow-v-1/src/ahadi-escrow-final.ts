import {
  Deposited as DepositedEvent,
  DisputeRaised as DisputeRaisedEvent,
  DisputeResolved as DisputeResolvedEvent,
  ExcessTokensRecovered as ExcessTokensRecoveredEvent,
  FeeUpdated as FeeUpdatedEvent,
  FeeWalletUpdated as FeeWalletUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  Refunded as RefundedEvent,
  Released as ReleasedEvent,
  Unpaused as UnpausedEvent
} from "../generated/AhadiEscrowFinal/AhadiEscrowFinal"
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
} from "../generated/schema"

export function handleDeposited(event: DepositedEvent): void {
  let entity = new Deposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealId = event.params.dealId
  entity.buyer = event.params.buyer
  entity.seller = event.params.seller
  entity.amount = event.params.amount
  entity.timeoutInSeconds = event.params.timeoutInSeconds

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDisputeRaised(event: DisputeRaisedEvent): void {
  let entity = new DisputeRaised(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealId = event.params.dealId
  entity.disputer = event.params.disputer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDisputeResolved(event: DisputeResolvedEvent): void {
  let entity = new DisputeResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealId = event.params.dealId
  entity.winner = event.params.winner
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExcessTokensRecovered(
  event: ExcessTokensRecoveredEvent
): void {
  let entity = new ExcessTokensRecovered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeUpdated(event: FeeUpdatedEvent): void {
  let entity = new FeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeWalletUpdated(event: FeeWalletUpdatedEvent): void {
  let entity = new FeeWalletUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newWallet = event.params.newWallet

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRefunded(event: RefundedEvent): void {
  let entity = new Refunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealId = event.params.dealId
  entity.buyer = event.params.buyer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReleased(event: ReleasedEvent): void {
  let entity = new Released(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealId = event.params.dealId
  entity.seller = event.params.seller
  entity.netAmount = event.params.netAmount
  entity.fee = event.params.fee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
