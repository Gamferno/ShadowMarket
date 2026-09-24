# ShadowMarket — Official Launch Tweets

The following 3 launch tweets are prepared for publication on X ([@ShadowMarketZK](https://x.com/ShadowMarketZK)) to introduce ShadowMarket to the Midnight, Cardano, and broader Web3 prediction market communities.

---

## Tweet 1: The Pitch & Why Midnight (What / Why)

> Prediction markets have achieved product-market fit. But on transparent chains like Polymarket, every bet is exposed to front-running, copy-trading bots, and permanent financial surveillance.
>
> Introducing **ShadowMarket** (@ShadowMarketZK): The first privacy-native prediction market protocol built on @MidnightNtwrk.
>
> 🔒 100% Shielded Stakes & Side Choices  
> 📈 Verifiable On-Chain Aggregate Odds  
> 🛡️ Zero MEV, Zero Doxxing  
> ⚡ Live now on Midnight Preprod!
>
> Read our architecture & try the live contract:  
> https://github.com/ompathak/ShadowMarket  
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
> 🌐 GitHub + Docs: https://github.com/ompathak/ShadowMarket  
> 📖 Step-by-Step Guide: https://github.com/ompathak/ShadowMarket/blob/main/docs/USAGE.md  
>
> Predict fearlessly. The future is confidential. 🌑
>
> #MidnightDev #PredictionMarkets #ZK #Web3
