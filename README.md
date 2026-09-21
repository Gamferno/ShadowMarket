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

## Live Preprod Deployment

- **Network**: Midnight Preprod
- **Contract Address**: [`a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f`](https://explorer.preprod.midnight.network/address/a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f)
- **Deployment Tx**: [`1136a4100f171c6a86a7e28ab7f4affd07b4c69b36bff5f74e04f1a3ff210108`](https://explorer.preprod.midnight.network/tx/1136a4100f171c6a86a7e28ab7f4affd07b4c69b36bff5f74e04f1a3ff210108)
- **Block Height**: 2,692,353
- **Deployer**: `mn_addr_preprod152e9j8z922lzkldpfp6fwtwnuf9nz5dy5gsyf3r84q7nvcmtr04scnww85`
- **Initial Market**: *"Will Midnight Mainnet launch with native Zero-Knowledge privacy in 2026?"*

