# AHADI (Promise)

AHADI (Swahili for "Promise") is a decentralized escrow application designed to bridge the trust gap between buyers and sellers.
By leveraging the Polygon blockchain and smart contracts, AHADI replaces expensive, slow traditional intermediaries with immutable code.

Built for the "Instagram Vendor" economy, AHADI allows sellers to generate payment links and buyers to lock funds securely until goods are delivered.

## Key features

- **Trustless escrow**
  - Funds are held by a smart contract, not a company bank account.
- **Payment links**
  - Sellers generate unique links (like an invoice) that auto-fill deal details for the buyer.
- **Gas sponsorship (account abstraction)**
  - Users sign in with Google (thirdweb In-App Wallet smart accounts) and the app can sponsor gas.
- **Stablecoin settlement**
  - Built on USDT (Polygon) to avoid crypto volatility.
- **Immutable timeouts**
  - Every deal has a hard-coded expiry (e.g., 3 days). If the seller ghosts, the buyer can be refunded after timeout.
- **O(1) scalability**
  - The smart contract tracks `totalLockedFunds` in state to keep certain operations constant-time.
- **Dispute resolution**
  - Either party can raise a dispute; the contract owner can resolve.

## What this repo contains

- **Web app** (Next.js App Router) in `app/`
- **Escrow smart contract** (Solidity) in `contracts/AhadiEscrow.sol`
- **Contract artifact** (ABI/bytecode JSON) in `artifacts/`

## Tech stack

- **Next.js** (App Router)
- **React**
- **TailwindCSS v4**
- **thirdweb SDK v5** (React)
- **Solidity (0.8.19) + OpenZeppelin** (Ownable, Pausable, ReentrancyGuard)

## Architecture

- **Deal creation**
  - Seller defines item, price, and timeout, then generates a link.
- **Locking**
  - Buyer opens the link, signs in (Google), approves USDT, and calls `createDeal(seller, amount, timeoutSeconds)`.
- **Holding**
  - Funds sit in the `AhadiEscrowFinal` smart contract.
- **Settlement**
  - Happy path: buyer calls `releaseFunds(dealId)` and USDT is sent to the seller (minus protocol fee).
  - Timeout: anyone can call `refundTimedOutDeal(dealId)` after expiry and funds return to the buyer.
- **Dispute**
  - Either party calls `raiseDispute(dealId)` and the owner resolves via `resolveDispute(dealId, winner)`.

## Local development

### Prerequisites

- Node.js (recommended: Node 18+)
- npm (this repo includes a `package-lock.json`)

### Install

```bash
npm install
```

### Environment variables

This project uses thirdweb. You must provide:

- `NEXT_PUBLIC_TEMPLATE_CLIENT_ID`
  - Used by `app/client.ts` and `app/page.tsx`.
  - Create a client ID in thirdweb and add it to your local environment.

Create a local env file (not committed; `.env*` is gitignored):

```bash
# .env.local
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id
```

### Run dev server

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

## Scripts

- **dev**: `npm run dev` (Next dev server)
- **build**: `npm run build` (production build)
- **start**: `npm run start` (serve production build)
- **lint**: `npm run lint`

## Project structure

```text
app/
  layout.tsx            # Root layout (wraps app with ThirdwebProvider)
  page.tsx              # Login page (Google auth via thirdweb ConnectButton)
  client.ts             # thirdweb client initialization (env var)
  dashboard/
    layout.tsx          # Dashboard shell + (optional) route protection
    page.tsx            # Dashboard flow + contract interaction
contracts/
  AhadiEscrow.sol       # Solidity escrow contract
artifacts/
  AhadiEscrow.sol/
    AhadiEscrow.json    # ABI/bytecode artifact
```

## Smart contract: `AhadiEscrowFinal` (in `contracts/AhadiEscrow.sol`)

The contract implements an escrow model around an ERC-20 stablecoin (USDT on Polygon):

- **createDeal(seller, amount, timeoutSeconds)**
  - Creates a new deal ID (auto-incremented) and transfers `amount` of `stablecoin` into the contract.
- **releaseFunds(dealId)**
  - Buyer releases escrow to seller.
  - A fee is taken (default: **2.5%** via `feeBasisPoints = 250`) and sent to `feeWallet`.
- **refundTimedOutDeal(dealId)**
  - After the deal expires, anyone can refund the buyer.
- **raiseDispute(dealId)** / **resolveDispute(dealId, winner)**
  - Either party can mark the deal as disputed; owner resolves to pay the `winner`.

Key storage:

- Deals are tracked by `mapping(uint256 => Deal) public deals;`
- `dealId` must be unique (reverts if reused).

## Chain / token configuration (important)

The UI currently includes hardcoded contract/token addresses and chain selection in `app/dashboard/page.tsx`.
Before using this in production you should:

- **Move addresses into environment variables** (recommended) and/or a dedicated config module.
- Ensure the **selected chain matches the token + contract deployment**.

Also note decimals:

- The dashboard uses `toUnits(formData.price, 6)`. **Polygon USDT uses 6 decimals**.
- If you change tokens, update the decimals accordingly.

## Current on-chain configuration (as coded)

The dashboard currently targets Polygon mainnet and uses hardcoded addresses:

- **Escrow contract**: `0xB85CcC1edc1070a378da6A5Fbc662bdC703Ce296`
- **USDT (Polygon)**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

Fees:

- **Protocol fee**: 2.5% by default (configurable by owner, capped at 10%)

If these are not the contracts you intend to use, you must update them (recommended: move them into env vars).

## thirdweb configuration (login + gas sponsorship)

- The app initializes the thirdweb client using `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` in:
  - `app/client.ts`
  - `app/page.tsx`
- The login page uses `inAppWallet({ auth: { options: ["google"] } })`.
- Smart accounts / sponsorship are enabled in two places:
  - `inAppWallet({ smartAccount: { chain: polygon, sponsorGas: true } })`
  - `ConnectButton accountAbstraction={{ chain: polygon, sponsorGas: true }}`

Note: `sponsorGas: true` uses thirdweb infrastructure for sponsored transactions. For Polygon mainnet, you typically need your thirdweb project configured appropriately (and, depending on your plan, billing/limits may apply).

## Smart contract deployment

This repo includes the Solidity contract (`contracts/AhadiEscrow.sol`) and an artifact JSON under `artifacts/`, but it does not include a full deployment framework (Hardhat/Foundry scripts/config) in the repo root.

If you want repeatable deployments, add a deployment setup (Hardhat or Foundry) and document:

- The deployed `AhadiEscrow` address per chain.
- The stablecoin address passed to the constructor.
- The `feeWallet` address.

## Deployment

This is a standard Next.js app. Common options:

- **Vercel**
  - Set `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` in Vercel project environment variables.
  - Deploy as a normal Next.js project.
- **Self-host**
  - `npm run build`
  - `npm run start`

## Troubleshooting

- **Error: “No client ID found”**
  - `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` is missing.
- **Next.js warning about multiple lockfiles / wrong workspace root**
  - If you see a warning about Next.js selecting `/home/joe/package-lock.json` instead of this repo’s lockfile, remove the extra lockfile or configure `turbopack.root` in `next.config.js`.
- **Transactions fail / stuck on pending**
  - Confirm wallet is on the expected chain.
  - Confirm you have gas token for that chain.
  - Confirm token address + decimals are correct.
- **Approve succeeds but createDeal fails**
  - Confirm the escrow contract address is correct.
  - Confirm the contract was deployed with the same `stablecoin` address you are approving.
  - Confirm `dealId` is unique.

## Next improvements (recommended)

- **Move chain + addresses into config/env** so you can switch testnet/mainnet safely.
- **Capture the seller address** (it’s currently a placeholder in the dashboard flow).
- **Persist deals off-chain** (today `dealId` is random in the UI; a database would help track status, participants, and receipts).
- **Add release/dispute flows to the UI** to match the full contract capability.

## Contributing

- Keep UI routes under `app/`.
- Prefer moving chain/contract constants out of React components into a shared config.
- Add a `.env.example` only if you want to share required env vars without leaking secrets.

## License

MIT
