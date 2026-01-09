import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AhadiEscrowFinal,
  Deposited,
  Released,
  Refunded,
  DisputeRaised,
  DisputeResolved
} from "../generated/AhadiEscrowFinal/AhadiEscrowFinal"
import { Deal, User } from "../generated/schema"

export function handleDeposited(event: Deposited): void {
  // 1. Create or Load the Deal Entity
  let deal = new Deal(event.params.dealId.toString())

  // 2. Populate Data
  // ⚡ FIX: Convert Bytes to Hex String for Entity Linking
  deal.buyer = event.params.buyer.toHexString()
  deal.seller = event.params.seller.toHexString()
  
  deal.amount = event.params.amount
  deal.timeoutInSeconds = event.params.timeoutInSeconds
  deal.createdAtTimestamp = event.block.timestamp
  deal.depositTx = event.transaction.hash

  // 3. Initialize Status
  deal.isCompleted = false
  deal.isDisputed = false
  deal.isRefunded = false

  // 4. Create Users BEFORE saving the deal
  // The Deal entity now strictly requires these User entities to exist
  let buyerId = event.params.buyer.toHexString()
  let buyer = User.load(buyerId)
  if (!buyer) {
    buyer = new User(buyerId)
    buyer.save()
  }

  let sellerId = event.params.seller.toHexString()
  let seller = User.load(sellerId)
  if (!seller) {
    seller = new User(sellerId)
    seller.save()
  }

  // 5. Save the Deal
  deal.save()
}

export function handleReleased(event: Released): void {
  let deal = Deal.load(event.params.dealId.toString())
  if (deal) {
    deal.isCompleted = true
    deal.releaseTx = event.transaction.hash
    deal.save()
  }
}

export function handleRefunded(event: Refunded): void {
  let deal = Deal.load(event.params.dealId.toString())
  if (deal) {
    deal.isCompleted = true
    deal.isRefunded = true
    deal.refundTx = event.transaction.hash
    deal.save()
  }
}

export function handleDisputeRaised(event: DisputeRaised): void {
  let deal = Deal.load(event.params.dealId.toString())
  if (deal) {
    deal.isDisputed = true
    deal.save()
  }
}

export function handleDisputeResolved(event: DisputeResolved): void {
  let deal = Deal.load(event.params.dealId.toString())
  if (deal) {
    deal.isDisputed = false
    deal.isCompleted = true
    deal.save()
  }
}
