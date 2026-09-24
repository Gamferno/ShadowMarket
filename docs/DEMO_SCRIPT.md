# ShadowMarket — MVP Demo Video Recording Script

**Target Duration**: ~1:48 minutes (108.3 seconds)  
**Format**: High-definition screen capture (2880x1800)  
**Deliverables**:
- [**`demo.mp4`**](../demo.mp4) (H.264 / AAC / yuv420p, 9.0 MB)
- [**`demo.webm`**](../demo.webm) (VP9 / yuv420p, 23.8 MB)  
**Target Audience**: Hackathon judges, Midnight Foundation, Web3 developers, DeFi prediction market users  

---

## Video Outline & Timing Breakdown

| Timestamp | Section | Visual on Screen | Key Talking Points |
|---|---|---|---|
| **0:00 – 0:30** | **The Problem & Intro** | Landing Page (`/`) with live Preprod badge | Polymarket proved demand, but transparent blockchains leak everything: copy-trading, front-running, and financial surveillance. Introducing ShadowMarket on Midnight. |
| **0:30 – 1:00** | **Wallet Connection & Markets Catalog** | Click "Connect Wallet" (1am), then navigate to `/markets` | CAIP-372 wallet connection, Proof Server status probe. Filter by category (Crypto/Macro, Politics, Sports), search input, and responsive market cards. |
| **1:00 – 1:40** | **Market Detail & Shielded Bet** | Market #1 Detail (`/markets/1`) | Show responsive SVG odds trajectory chart. Select YES, enter 50 tDUST stake. Show in-flight multi-stage progress (Witness → Local PLONK Prover on port 6300 → Injected wallet balance → Preprod broadcast). Show Explorer verification. |
| **1:40 – 2:10** | **Private Portfolio & Client-Side Decryption** | Portfolio Page (`/portfolio`) | Show Open Positions tab. Highlight that receipts and commitments exist only in browser private state and are never leaked to public indexers or RPC nodes. |
| **2:10 – 2:40** | **Oracle Resolution & ZK Payout Claim** | Resolver Console (`/admin`) → Claim button | Show Close Bidding and Resolve YES with confirmation modal. Return to Portfolio History tab and click "Claim Payout". Explain how one-way nullifiers prevent double-claims without linking to the original bet. |
| **2:40 – 3:00** | **Conclusion & Call to Action** | GitHub repo and README table | Live on Midnight Preprod contract `a52c2b...` at block 2,692,353. All 7 pages live. Open source under MIT license. |

---

## Detailed Voiceover Script

### [0:00 – 0:30] Hook & Problem Statement
> *"Welcome to the demonstration of ShadowMarket — the first privacy-native prediction market protocol built on the Midnight Network.*
>
> *Prediction platforms like Polymarket have reached massive adoption, but they suffer from a fundamental flaw: on transparent blockchains, every single trade, stake amount, and wallet address is broadcast in plaintext. Whales are copy-traded, searchers front-run orders in the mempool, and user opinions are permanently doxxed on public ledgers.*
>
> *ShadowMarket solves this by separating private execution from public state using Midnight's client-side Zero-Knowledge proofs."*

### [0:30 – 1:00] Wallet & Catalog
> *"Let's connect our wallet. ShadowMarket integrates directly with Midnight's 1am and Lace extensions using CAIP-372. Notice the green indicator in our navbar — our local Docker proof server on port 6300 is healthy and ready to generate PLONK proofs.*
>
> *Heading to the Markets catalog, we see active binary prediction markets across Crypto, Politics, Sports, and Civic categories. We can search in real time, filter categories, and sort by highest volume or newest listings."*

### [1:00 – 1:40] Placing a Shielded Bet
> *"Let's click into Market #1: 'Will Midnight Mainnet launch with native Zero-Knowledge privacy in 2026?'. Here we have a dynamic SVG odds trajectory chart verified by Compact's `discloseOdds` circuit.*
>
> *Now, let's place a 50 tDUST bet on YES. When I click 'Place Shielded Bet', watch the pipeline: our browser generates the witness, our local proof server computes the PLONK circuit proof, and the 1am wallet signs the transaction.*
>
> *On-chain, only the opaque 32-byte commitment hash and aggregate market odds are updated. No one knows our wallet address, bet size, or chosen side."*

### [1:40 – 2:10] Private Portfolio
> *"Let's open the Portfolio tab. Here, our positions are decrypted client-side for our eyes only. We can track our active stake, date placed, and commitment hash. These records remain strictly confidential in local storage and are never published to public indexers."*

### [2:10 – 2:40] Admin Resolution & Anonymous Claim
> *"Now, let's switch to the Resolver Console. As the creator or admin, we can close market bidding and resolve the outcome. Let's resolve to YES. Notice the irreversible confirmation warning safeguarding participants.*
>
> *Once resolved on Preprod, we head back to Portfolio History. Our winning bet now features a 'Claim Payout' button. When we claim, our machine proves in ZK that we own a winning ticket, and derives a cryptographic nullifier that is burned on-chain to prevent double-spending without ever revealing which bet we are claiming."*

### [2:40 – 3:00] Conclusion
> *"ShadowMarket is 100% operational on the Midnight Preprod testnet at contract `a52c2b11...`, deployed at block 2,692,353 with all 7 pages fully built, tested, and automated via GitHub Actions CI/CD.*
>
> *Check out the repo, review our docs, and predict fearlessly on Midnight Network. Thank you!"*
