# ShadowMarket

> Privacy-native prediction markets on the Midnight Network.

## Overview
ShadowMarket lets people bet on real-world outcomes with fully shielded individual positions and publicly verifiable aggregate odds — combining Polymarket's product-market fit with privacy guarantees no fully-public chain can offer.

### Core Privacy Model
- **Public**: Market question, resolution source/outcome, aggregate odds, total volume.
- **Private**: Individual bet size, individual bet side, any link between a bettor and a position.
- **Proved without revealing**: That public odds correctly reflect all private bets; that payouts are proportionally correct for the winning side.

## Tech Stack
- **Smart Contracts**: Compact (`contracts/shadowmarket.compact`)
- **ZK Cryptography**: Midnight Network (PLONK ZK-SNARKs)
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Testing**: Vitest
