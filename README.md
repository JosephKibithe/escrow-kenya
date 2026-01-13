# AHADI (Promise)

AHADI (Swahili for "Promise") is a decentralized escrow application designed to bridge the trust gap between buyers and sellers in the "Instagram Vendor" economy. It replaces expensive, slow traditional intermediaries with immutable smart contracts on the Polygon blockchain.

## Key Features

- **Trustless Escrow**: Funds are held by a smart contract, not a middleman.
- **Payment Links**: Sellers generate unique links that auto-fill deal details for buyers.
- **Gas Sponsorship**: Account abstraction via thirdweb allows users to transact without needing MATIC for gas.
- **Stablecoin Settlement**: Uses **USDT (Polygon)** to avoid crypto volatility.
- **Immutable Timeouts**: Hard-coded expiries ensure funds are never locked indefinitely.
- **Dispute Resolution**: Built-in mechanism for resolving disagreements.

---

## Tech Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS v4
- **Blockchain SDK**: thirdweb SDK v5 (React), Account Abstraction (Smart Wallets)
- **Smart Contracts**: Solidity (0.8.19), OpenZeppelin (Ownable, Pausable, ReentrancyGuard)
- **Indexing**: The Graph (Subgraph at `ahadi-escrow-v-1`)
- **Network**: Polygon PoS (Mainnet)

## Project Structure

```text
app/
├── dashboard/
│   ├── SellerRequestGenerator.tsx  # Logic for generating payment links
│   └── page.tsx                    # Main dashboard & contract interactions
├── contracts/
│   └── AhadiEscrow.sol             # Core escrow logic
├── ahadi-escrow-v-1/               # Subgraph for indexing events
└── artifacts/                      # Contract ABIs
```

---

## Application Flow Scenarios

### Scenario A: Seller Initiated (Payment Link)
*Best for Instagram/WhatsApp vendors sending an invoice.*

1.  **Seller**: Logs in and goes to "Create Payment Link".
2.  **Seller**: Enters Item Name, Price (USDT), Description, and Timeout (e.g., 3 days).
3.  **App**: Generates a unique URL containing these parameters.
4.  **Seller**: Sends the link to the Buyer via WhatsApp/DM.
5.  **Buyer**: Clicks the link. The App opens with "Item", "Price", and "Seller Address" pre-filled.
6.  **Buyer**: Connects wallet (or social login) and approves USDT usage.
7.  **Buyer**: Clicks "Create Deal". Funds are deducted and locked in the Smart Contract.

### Scenario B: Buyer Initiated (Direct Deal)
*Best when Buyer knows the Seller's address.*

1.  **Buyer**: Logs in and navigates to "Create Deal".
2.  **Buyer**: Manually enters Seller's Wallet Address, Amount, and Timeout.
3.  **Buyer**: Approves USDT and confirms the transaction.
4.  **Contract**: Locks funds and emits a `Deposited` event.

### Scenario C: Settlement (Happy Path)
1.  **Seller**: Delivers the item/service.
2.  **Buyer**: Verifies the item in the Dashboard.
3.  **Buyer**: Clicks **"Release Funds"**.
4.  **Contract**: Transfers USDT to the Seller (minus 2.5% protocol fee) and marks deal as `Completed`.

### Scenario D: Timeouts & Refunds
*If the Seller vanishes or fails to deliver.*

1.  **System**: Deal reaches its `expiryTime` (e.g., 3 days pass).
2.  **Action**: Anyone (usually the Buyer) calls `refundTimedOutDeal`.
3.  **Contract**: Checks timestamp > expiry. Transfers full amount back to Buyer.

### Scenario E: Disputes
*If the Buyer receives a rock instead of an iPhone.*

1.  **Action**: Either party clicks **"Raise Dispute"** before the deal expires.
2.  **Contract**: Locks the funds permanently until Admin intervention.
3.  **Resolution**: Admin reviews evidence (off-chain) and calls `resolveDispute` to send funds to the correct party.

---

## Local Development

### Prerequisites
- Node.js 18+
- npm (use `package-lock.json`)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file:
```bash
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Smart Contract Details
**Contract**: `AhadiEscrowFinal`
- **Logic**: Holds funds `totalLockedFunds` to allow O(1) scalability.
- **Fees**: Defaults to 2.5%, sent to a `feeWallet`.
- **Addresses (Polygon Mainnet)**:
    - Escrow: `0xB85CcC1edc1070a378da6A5Fbc662bdC703Ce296`
    - USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

*> **Note**: Always verify chain ID and token addresses in `app/dashboard/page.tsx` before mainnet deployment.*
