# ShadowMarket

[![CI](https://github.com/ompathak/ShadowMarket/actions/workflows/ci.yml/badge.svg)](https://github.com/ompathak/ShadowMarket/actions/workflows/ci.yml)
[![Network: Midnight Preprod](https://img.shields.io/badge/Network-Midnight%20Preprod-7c3aed)](https://explorer.preprod.midnight.network/address/a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f)
[![Compact: v0.22](https://img.shields.io/badge/Compact-v0.22-cyan)](https://github.com/midnightntwrk/compact)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![X Profile](https://img.shields.io/badge/Follow-@ShadowMarketZK-black?logo=x)](https://x.com/ShadowMarketZK)

> **Privacy-Native Prediction Markets on the Midnight Network.**  
> Bet on real-world outcomes with 100% shielded individual stakes and side choices while aggregate market odds update on-chain verifiably via Zero-Knowledge PLONK proofs.

---

## Live Preprod Deployment

ShadowMarket is deployed and operational on the **Midnight Preprod Testnet**:

| Parameter | Value | Links |
|---|---|---|
| **Target Network** | `Midnight Preprod` | [Preprod Status](https://docs.midnight.network/) |
| **Contract Address** | `a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f` | [View on Explorer ↗](https://explorer.preprod.midnight.network/address/a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f) |
| **Deployment Transaction** | `1136a4100f171c6a86a7e28ab7f4affd07b4c69b36bff5f74e04f1a3ff210108` | [View Transaction ↗](https://explorer.preprod.midnight.network/tx/1136a4100f171c6a86a7e28ab7f4affd07b4c69b36bff5f74e04f1a3ff210108) |
| **Block Height** | `2,692,353` | Block #2,692,353 |
| **Deployer Wallet** | `mn_addr_preprod152e9j8z922lzkldpfp6fwtwnuf9nz5dy5gsyf3r84q7nvcmtr04scnww85` | Unshielded Preprod Address |
| **Initial Market #1** | *"Will Midnight Mainnet launch with native Zero-Knowledge privacy in 2026?"* | Live on Preprod Ledger |
| **Live Web App Demo** | `http://localhost:3000/` | Local & Static SPA (`HashRouter`) |
| **Demo Video (MP4)** | [`demo.mp4`](demo.mp4) | Universal H.264 / 2880x1800 @ 30fps (22.2 MB) |
| **Demo Video (WebM)** | [`demo.webm`](demo.webm) | High-Efficiency VP9 / 2880x1800 @ 30fps (13.2 MB) |

---

## 🎬 Video Demonstration

Watch the complete end-to-end protocol walkthrough demonstrating live wallet connection, market exploration, shielded Zero-Knowledge bet placement, permissionless market creation, decrypted private portfolio receipts, and oracle resolver operations on Midnight Preprod:

- **Download / Stream MP4 (Universal H.264)**: [**`demo.mp4`**](demo.mp4) *(22.2 MB, 2880x1800 @ 30fps)*
- **Download / Stream WebM (VP9)**: [**`demo.webm`**](demo.webm) *(13.2 MB, 2880x1800 @ 30fps)*
- **Demo Script & Breakdown**: [**`docs/DEMO_SCRIPT.md`**](docs/DEMO_SCRIPT.md)

---

## Why ShadowMarket?

Transparent blockchain prediction markets (such as Polymarket) suffer from three fatal structural vulnerabilities:

1. **Front-running & Toxic MEV**: Searchers and bots inspect the public mempool to front-run large bets or manipulate liquidity before block confirmation.
2. **Copy-Trading Exploitation**: High-alpha research analysts and domain experts cannot build sizable positions without automated copy-trading bots immediately crushing their odds.
3. **Surveillance & Doxxing**: Public ledger trails permanently tie a user's wallet address to their political, religious, philosophical, or financial beliefs.

**ShadowMarket solves this by leveraging Midnight Network's dual-state architecture:**
- Individual wager amounts, side choices (YES or NO), and bettor identity are **100% confidential**.
- The public ledger updates only the aggregate odds and liquidity pool via **Zero-Knowledge proofs**.
- Winning payouts are claimed **anonymously** using one-way cryptographic nullifiers, ensuring zero linkability between the original bet commitment and the payout withdrawal.

---

## Zero-Knowledge Privacy Architecture

ShadowMarket enforces strict separation across Midnight's three execution boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC LEDGER (ON-CHAIN)                        │
│  - Market metadata (Question, Category, Resolution Source)             │
│  - Aggregate totalVolume, totalStakeYes, totalStakeNo                  │
│  - Bet Commitments: Map<Bytes<32>, Boolean> (Opaque hashes)            │
│  - Claimed Nullifiers: Set<Bytes<32>> (Double-claim prevention)        │
│  - Disclosed Odds (via Compact discloseOdds circuit)                   │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │  Verified by On-Chain Verifier
                                     │  (ZK-SNARK PLONK Proof)
┌────────────────────────────────────┴───────────────────────────────────┐
│                     CLIENT ZK CIRCUIT (LOCAL DOCKER)                   │
│  - placeShieldedBet: Proves stake > 0 & updates volume correctly       │
│  - discloseOdds: Verifies integer percentage odds arithmetic           │
│  - claimPayout: Proves commitment ownership & proportional payout      │
│  - Generates deterministic nullifier from secretKey + bet nonce        │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │  Witness Context
                                     │  (Never leaves browser)
┌────────────────────────────────────┴───────────────────────────────────┐
│                   PRIVATE WITNESS (BROWSER STORAGE)                    │
│  - Bettor secretKey (Seed / Derived Private Key)                       │
│  - Individual bet direction (isYes: true / false)                      │
│  - Individual bet amount (Confidential wager)                          │
│  - Random salt (nonce) ensuring commitment hiding property             │
└────────────────────────────────────────────────────────────────────────┘
```

### Cryptographic Circuits

| Circuit | Execution | Ledger State Affected | Confidential Witness Inputs |
|---|---|---|---|
| `createMarket` | Public/Circuit | `marketCounter`, `markets` | Caller secret key |
| `placeShieldedBet` | Client ZK Proof | `betCommitments`, `markets` | Bet amount, isYes, bettor pk, nonce |
| `discloseOdds` | Client ZK Proof | Reads `markets` | Market ID, disclosed odds |
| `closeMarket` | Public/Circuit | `markets.state = Closed` | Caller secret key |
| `resolveMarket` | Public/Circuit | `markets.state = Resolved` | Caller secret key, winning outcome |
| `claimPayout` | Client ZK Proof | `claimedNullifiers` | BetData, salt, user secret, payout share |

---

## Application Pages & User Flows

ShadowMarket features all 7 production pages specified in the system design:

1. **Landing Page (`/`)**: Hero pitch, live Preprod status badges, 3-step Zero-Knowledge privacy flow diagram, protocol metrics, and featured on-chain market.
2. **Markets Catalog (`/markets`)**: Search filter, category selection chips (`Crypto/Macro`, `Politics`, `Sports`, `Local/Civic`, `Custom`), sorting options, and interactive market cards.
3. **Market Detail (`/markets/:id`)**: Dual-curve responsive SVG odds trajectory chart (YES vs. NO probability), shielded bet panel, potential return multiplier, and post-resolution payout claims.
4. **Create Market (`/create`, `/markets/new`)**: Permissionless market deployment form with live card preview, wired to the `createMarket` circuit on Preprod.
5. **Private Portfolio (`/portfolio`)**: Client-side decrypted positions dashboard with **Open Positions** and **History & Claims** tabs, plus one-click **Claim Payout** wired to `claimPayout` with nullifiers.
6. **Resolver & Admin Console (`/admin`)**: Oracle attestation dashboard with **Close Bidding**, **Resolve YES**, **Resolve NO**, and **Refund** actions safeguarded by an irreversible confirmation modal.
7. **About & Architecture (`/about`)**: Technical explainer comparing Polymarket vs. ShadowMarket, detailed execution boundaries, and interactive FAQ accordion.

---

## Tech Stack

- **Smart Contract Language**: Compact `pragma language_version >= 0.22`
- **Zero-Knowledge Runtime**: Midnight Network PLONK Prover & Verifier (`@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/compact-js`)
- **Web3 Wallet Integration**: Midnight DApp Connector CAIP-372 API (1am Wallet & Midnight Lace)
- **Frontend Framework**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS
- **Routing**: `react-router-dom` v7 with `HashRouter` (guaranteeing 404-free static page reloads)
- **State & Cryptography**: `@midnight-ntwrk/midnight-js-contracts`, `inMemoryPrivateStateProvider`, `localStorage` receipt persistence
- **Testing**: Vitest 3 with Compact JavaScript simulator
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ompathak/ShadowMarket.git
cd ShadowMarket
npm install
```

### 2. Start the Midnight Proof Server (Docker)
In a separate terminal, launch the local Docker proof server:
```bash
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  midnightntwrk/proof-server:3.0.9
```

Verify that the proof server is healthy:
```bash
curl http://127.0.0.1:6300/
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000/`.

---

## Testing & Verification

Run the comprehensive unit test suite covering multi-market creation, odds disclosure, resolution authority, and shielded payout claims:

```bash
# Run 14 contract and cryptographic lifecycle unit tests
npm test

# Run strict TypeScript typecheck
npm run lint

# Build production bundle
npm run build
```

---

## Documentation Links

- [**docs/USAGE.md**](docs/USAGE.md): Complete end-to-end user guide, privacy breakdown table, and troubleshooting playbook.
- [**docs/LAUNCH_TWEETS.md**](docs/LAUNCH_TWEETS.md): Official launch tweets and marketing copy.
- [**docs/DEMO_SCRIPT.md**](docs/DEMO_SCRIPT.md): Step-by-step 3-minute video recording walkthrough script.

---

## Community & Ecosystem Attribution

- **Product X (Twitter)**: [@ShadowMarketZK](https://x.com/ShadowMarketZK)
- **Midnight Network**: Built with pride on [Midnight Network](https://midnight.network) using Compact smart contracts.
- **Electric Capital Ecosystem**: This project is part of the Midnight developer ecosystem and tagged with `midnightntwrk` and `compact`.

---

## License

This project is licensed under the [MIT License](LICENSE).
