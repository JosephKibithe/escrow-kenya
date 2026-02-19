# AHADI (Promise)

AHADI (Swahili for "Promise") is a decentralized escrow application designed to bridge the trust gap between buyers and sellers in the "Instagram Vendor" economy. It replaces expensive, slow traditional intermediaries with immutable smart contracts on the Polygon blockchain, wrapped in a premium **Black & Gold Glassmorphism** UI.

![AHADI Dashboard Preview](public/preview-dashboard.png)

## Key Features

- **Trustless Escrow**: Funds are held by a smart contract, not a middleman.
- **3D Interactive Experience**: Features a real-time 3D gold padlock that reacts to user interaction.
- **Glassmorphism UI**: A modern, premium aesthetic with frosted glass cards, noise textures, and smooth animations.
- **Payment Links**: Sellers generate unique links that auto-fill deal details for buyers.
- **Gas Sponsorship**: Account abstraction via thirdweb allows users to transact without needing MATIC for gas.
- **Stablecoin Settlement**: Uses **USDT (Polygon)** to avoid crypto volatility.
- **Immutable Timeouts**: Hard-coded expiries ensure funds are never locked indefinitely.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4
- **3D & Animation**: React Three Fiber, Drei, Framer Motion (Texture/Model Loading)
- **Icons**: Lucide React
- **Blockchain SDK**: Reown AppKit (formerly Web3Modal), Wagmi, Viem
- **Smart Contracts**: Solidity (0.8.19), OpenZeppelin
- **Indexing**: The Graph (Subgraph at `ahadi-escrow-v-1`)
- **Network**: Polygon PoS (Mainnet)

## Project Structure

```text
app/
├── components/
│   ├── PadlockScene.tsx        # 3D Model logic & Environment
│   ├── DashboardPreview.tsx    # Glassmorphism card stack component
│   └── GlassCard.tsx           # Reusable glass UI component
├── dashboard/
│   ├── SellerRequestGenerator.tsx  # Logic for generating payment links
│   ├── MyDeals.tsx                 # Buyer/Seller deal management
│   ├── AdminStats.tsx              # Admin dashboard for disputes/fees
│   ├── layout.tsx                  # Dashboard layout wrapper
│   └── page.tsx                    # Main dashboard & contract interactions
├── contracts/
│   └── AhadiEscrow.sol             # Core escrow logic
├── constants/
│   └── index.ts                    # Contract addresses & ABIs
└── public/                         # Static assets (3D models, logos)
```

---

## Application Flow

### Scenario A: Seller Initiated (Payment Link)

1.  **Seller**: Generates a link with Item Name, Price (USDT), and Timeout.
2.  **Buyer**: Clicks link, connects wallet.
3.  **Buyer**: Locks funds in Smart Contract.

### Scenario B: Buyer Initiated (Direct Deal)

1.  **Buyer**: Manually enters Seller Address and Price.
2.  **Buyer**: Locks funds.

### Scenario C: Settlement

1.  **Buyer**: Verifies item.
2.  **Buyer**: Releases funds -> Seller gets paid instantly.

### Scenario D: Disputes

1.  **Action**: Either party raises dispute.
2.  **Resolution**: Admin intervenes based on off-chain evidence.

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```bash
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Smart Contract Details

- **Network**: Polygon Mainnet
- **USDT**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **Escrow Contract**: `0x7445B80f07ffcC031cecd3FC645878Baa8373819`

_> **Note**: Always verify chain ID and token addresses in `constants/index.ts` before interacting on-chain._
