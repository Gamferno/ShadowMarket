# ShadowMarket — Official Launch Tweets

The following launch tweets are prepared for publication on X ([@shadow_market1](https://x.com/shadow_market1)) to introduce ShadowMarket to the Midnight, Cardano, and broader Web3 prediction market communities.

---

## Tweet 1: The Pitch & Why Midnight (What / Why)

> Prediction markets have achieved product-market fit. But on transparent chains like Polymarket, every bet is exposed to front-running, copy-trading bots, and permanent financial surveillance.
>
> Introducing **ShadowMarket** (@shadow_market1): The first privacy-native prediction market protocol built on @MidnightNtwrk.
>
> 🔒 100% Shielded Stakes & Side Choices  
> 📈 Verifiable On-Chain Aggregate Odds  
> 🛡️ Zero MEV, Zero Doxxing  
> ⚡ Live now on Midnight Preprod!
>
> Read our architecture & try the live contract:  
> https://github.com/Gamferno/ShadowMarket  
> #MidnightNetwork #ZeroKnowledge #DeFi #Cardano #Web3Privacy

---

## Tweet 2: Technical Deep Dive (Cryptographic Architecture)

> How does ShadowMarket prove odds without revealing who bet what? 🧠
>
> Using Midnight’s Compact smart contract language:
>
> 1️⃣ **Client-Side ZK Proving**: Bettors generate a PLONK proof of solvency using `persistentCommit<BetData>`. Amount & direction (YES/NO) never leave the browser.
>
> 2️⃣ **Verifiable Odds Tally**: The `discloseOdds` circuit proves on-chain that public percentage odds strictly reflect the sum of all hidden bets without opening any individual position.
>
> 3️⃣ **Unlinkable Payouts**: Winners claim proportional shares via deterministic nullifiers derived from their secret key:
> `persistentHash(["shadowmarket:nullifier:", secretKey, nonce])`
>
> Zero link between your bet and your claim. Impossible to front-run.
>
> Deployed at block 2,692,353 on Preprod:  
> `a52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f`
>
> #MidnightNetwork #ZKPs #CompactLang #Cryptography

---

## Tweet 3: Demo & Call to Action (Try It on Preprod)

> Ready to experience confidential prediction markets?
>
> Watch our 2-minute walkthrough showing:
> ▫️ Connecting via 1am / Lace  
> ▫️ Placing a shielded bet with local PLONK proof generation  
> ▫️ Monitoring private positions decrypted client-side  
> ▫️ Oracle resolution & claiming payouts via ZK nullifiers  
>
> 🌐 GitHub + Docs: https://github.com/Gamferno/ShadowMarket  
> 📖 Step-by-Step Guide: https://github.com/Gamferno/ShadowMarket/blob/main/docs/USAGE.md  
>
> Predict fearlessly. The future is confidential. 🌑
>
> #MidnightDev #PredictionMarkets #ZK #Web3

---

## Short-Form 1:1 Square Posts (< 280 Characters)

### Short Post 1: Launch & Core Value Prop
**Image**: [`assets/social/post1_square.jpg`](../assets/social/post1_square.jpg)

```text
Transparent prediction markets leak your alpha and dox your beliefs.

@shadow_market1 fixes this.

🛡️ 100% shielded stakes & sides
⚡ Aggregate odds via Zero-Knowledge proofs
🔒 Unlinkable payout claims

Predict fearlessly on @MidnightNtwrk 🌑

#MidnightNetwork #ZeroKnowledge #Web3
```

---

### Short Post 2: Live on Preprod Announcement
**Image**: [`assets/social/post2_square.jpg`](../assets/social/post2_square.jpg)

```text
ShadowMarket is officially LIVE on @MidnightNtwrk Preprod! 🚀

Bet on real-world outcomes with zero front-running and zero copy-trading.

📜 Contract: 0xa52c...e75f
🔍 Explorer: https://preprod.midnightexplorer.com/contracts/0xa52c2b11fa381d65fdf201642560cc949a8b6b0427da02bc327bd090012ce75f

#DeFi #ZK #Web3
```
