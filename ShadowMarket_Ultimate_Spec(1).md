# ShadowMarket — Ultimate Spec
Single source of truth for the agent harness: what this is, what it needs to build, and the order to build it in. Feed the whole file for context, then work phase by phase from Part 4 — don't start a phase until the previous one's exit criteria are met.

---

## PART 1 — WHAT WE'RE BUILDING

**One-line pitch:** ShadowMarket lets people bet on real-world outcomes with fully shielded individual positions and publicly verifiable aggregate odds — combining Polymarket's proven product-market fit with privacy guarantees no fully-public chain can offer.

**Problem.** Public prediction markets (Polymarket, Augur) proved the model, but full on-chain transparency breaks it in three ways:
- **Whale signaling** — visible large bets get read as information, so other bettors herd instead of forming independent belief.
- **Mempool front-running** — bots watch pending transactions and race large orders, degrading execution for everyone else.
- **Permanent doxxing** — positions are pseudonymous, not private, closing off any market where the bettor has a real reason not to want their position known (their employer, local politics, sensitive outcomes).

**Solution.** Individual bets — size and direction — stay shielded end-to-end as confidential assets. No participant, operator, or observer can see who bet what, ever. The contract still does the one job a prediction market exists for: it computes and publishes only the **aggregate odds** via zero-knowledge proofs, so the market-wide signal stays public and useful without exposing any individual position. At resolution, it verifiably pays out the winning side and proves settlement was correct without ever revealing who held which position.

**How it works, end to end:**
1. Market created with a question, resolution source, and close time.
2. User commits a shielded bet (amount + side) as a confidential asset; a ZK proof shows it's well-formed without revealing its contents.
3. The contract proves the public odds are the correct aggregate of the private tally, without opening any individual bet.
4. At resolution, the contract proves the correct outcome and pays out proportionally — provably correct, without revealing any position.

**Why Midnight specifically.** Public-chain prediction markets can't do this without leaving the chain's trust model (e.g. off-chain order books, which just reintroduce a trusted operator). Midnight's dual-ledger design lets public and shielded state coexist in the same contract; Compact lets the market logic be written and proven without hand-rolling ZK circuits; selective disclosure is exactly the primitive the product needs — reveal the aggregate, not the components.

**Markets this unlocks that public chains can't support:** local/civic elections, outcomes tied to one's own employer or industry, politically sensitive outcomes, and any market where whale visibility currently suppresses honest participation.

**Open decisions / risks to carry into the build:**
- Resolution trust: admin-attested key vs. oracle feed — **decide in Phase 2**, don't leave it implicit.
- Liquidity bootstrapping: thin shielded markets can be moved by one large bet with no visible "whale" to react to.
- Odds update frequency: continuous proof generation per bet vs. batched updates — a real UX/complexity tradeoff.
- Regulatory posture: privacy-preserving betting on politics/elections draws more scrutiny than generic DeFi — scope launch categories accordingly.

---

## PART 2 — PRODUCT DESIGN (what the harness must build)

**File structure:**
```
shadowmarket/
├── contracts/
│   └── shadowmarket.compact
├── managed/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── BetPlacement.tsx       ← main privacy feature UI
│   │   ├── OddsDisplay.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   └── useMidnight.ts
│   ├── utils/
│   │   └── contract.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── shadowmarket.test.ts
├── .github/workflows/ci.yml
├── docs/USAGE.md
├── README.md
├── PROPOSAL.md
└── package.json
```

**Global layout (every page):** navbar (logo, Markets, Create Market, My Bets, About, Connect Wallet / address+Disconnect once connected); footer (GitHub, X, docs); toast system for tx submitted / proof generating / confirmed / failed.

**Pages:**

1. **Landing (`/`)** — hero + one-line pitch, **Launch App** button → Markets, **How It Works** button → About, 3-step visual (shielded bet → public odds update → private claim).

2. **Markets List (`/markets`)** — search input, category filter chips (Politics, Sports, Crypto/Macro, Local/Civic, Custom), sort (Trending, Closing Soon, Newest, Highest Volume), market cards (question, live odds bar, volume, time remaining, **View Market** button), empty state with **Create Market** button.

3. **Market Detail (`/markets/:id`)** — header (question, category, resolution source, close time); odds-over-time chart (public data only); bet panel (**YES**/**NO** toggle, amount input, payout preview, privacy note, **Place Shielded Bet** button → confirm modal with **Confirm**/**Cancel**, proof-generation loading state); post-close: **Claim Payout** button (always shown post-resolution regardless of outcome, so its mere presence never leaks a position — it just succeeds or reverts); **Share Market** button.

4. **Create Market (`/markets/new`)** — form (Question, Description, Category, Resolution source, Close date/time), **Preview** button, **Submit Market** button.

5. **Portfolio (`/portfolio`)** — connect-wallet gate; tabs **Open Positions** / **History**; open positions list (market, side, amount, status, **View Market** link — decrypted client-side for the owner only); history tab with **Claim** button on unclaimed wins; empty state with **Browse Markets** button.

6. **Admin/Resolution (`/admin`, gated to resolver role)** — list of closed markets awaiting resolution; **Resolve YES** / **Resolve NO** buttons per market; confirmation modal before finalizing (irreversible).

7. **About (`/about`)** — plain-language privacy model explainer, FAQ accordion, links to GitHub/X/docs.

**Cross-cutting states to build everywhere, not just the happy path:** loading (page load, proof generation, tx pending), error (wallet not connected, insufficient balance, tx rejected, network error), empty (no markets, no bets, no history).

---

## PART 3 — TECHNICAL ARCHITECTURE: ON-CHAIN vs OFF-CHAIN

**On-chain — public ledger state:** market metadata (question, category, resolution source, close time), aggregate odds, total volume, market status (open/closed/resolved), final outcome once resolved, resolver/oracle attestation reference.

**On-chain — shielded state (private witnesses / confidential assets):** individual bet amount, individual bet side, the bet's commitment (never links to a public identity), a payout nullifier per claim (blocks double-claims without revealing which bet it pays out).

**On-chain — circuits:**
- `createMarket` — sets up public metadata.
- `placeBet` — locks funds as a confidential asset, updates the shielded tally, proves validity without revealing contents.
- `discloseOdds` — proves the public odds figure is the correct aggregate of the shielded tally, without opening any individual bet.
- `resolveMarket` — records the outcome, gated by close time + resolver authority.
- `claimPayout` — proves a winning shielded position and correct proportional payout, pays out a confidential asset, burns the nullifier.

**Deliberately off-chain:** market browsing/search/filter/sort, odds chart rendering (reads public state, draws client-side), the oracle's real-world fact-finding process (only the final attested outcome goes on-chain), notifications, docs, marketing.

**Privacy model, stated plainly (goes in README later):**
- PUBLIC: market question, resolution source/outcome, aggregate odds, total volume.
- PRIVATE: individual bet size, individual bet side, any link between a bettor and a position.
- PROVED WITHOUT REVEALING: that public odds correctly reflect all private bets; that payouts are proportionally correct for the winning side.

---

## PART 4 — PHASED BUILD PLAN
Bounded runs. Don't start a phase until the previous phase's exit criteria are actually met. **The contract deploys to Preprod at Phase 3 — right after it's written and tested, before any frontend work starts.** Every frontend phase after that builds against the live contract, not a mock.

**Phase 0 — Scaffolding & Tooling**
Build: full folder structure, package.json + deps, empty placeholder files, git init + first commit.
Exclude: any contract or UI logic.
Exit: structure matches spec exactly; `npm install` runs clean.

**Phase 1 — Contract: Market State & Bet Placement**
Build: public ledger state (question, category, resolution source, close time, status); shielded witnesses (amount, side, commitment); `createMarket`; `placeBet`; top-of-file privacy-model comment block.
Exclude: odds disclosure, resolution, payout — not even stubs.
Exit: `compact compile` succeeds; ≥1 passing test each for `createMarket` and `placeBet`.

**Phase 2 — Contract: Odds, Resolution & Payout**
Build: `discloseOdds`; `resolveMarket` (**decide admin-attested vs. oracle now**, note the choice in the comment block); `claimPayout` with nullifier.
Exclude: any frontend work.
Exit: ≥3 passing tests total (bet placement, correct odds derivation, correct proportional payout); full `compact compile` clean.

**Phase 3 — Deploy Contract to Preprod**
Do this immediately once Phase 1–2 are done and tested — **before any frontend, CI/CD, or docs work.** Building UI against a live deployed contract catches integration issues early instead of at the end; building against a mock and swapping later just moves the pain.
Build: get the exact deploy command; deploy the Phase 1–2 contract to Preprod; capture and record the contract address.
Exclude: no frontend, no CI, no docs yet — this phase is deploy only.
Exit: contract has a live, verifiable Preprod address, confirmed reachable before writing a single line of frontend code.

**Phase 4 — Frontend: Wallet & Core Bet Flow**
Build: `WalletConnect.tsx`, `useMidnight.ts`, `utils/contract.ts`; Market Detail page bet panel + confirm modal + loading/error/success states; wire `placeBet` end-to-end against the **live Phase 3 Preprod contract address**, not a stub.
Exclude: markets list, landing, portfolio, admin, create-market form — hardcode a single market ID to develop against.
Exit: `npm run build` zero errors; a real shielded bet lands on the deployed Preprod contract from the UI.

**Phase 5 — Frontend: Markets List, Odds Display & Landing**
Build: Landing page; Markets List page (search/filter/sort/cards/empty state); `OddsDisplay.tsx` + odds chart wired to `discloseOdds`; global nav + footer.
Exclude: create-market form, portfolio, admin.
Exit: ≥2 seeded markets browsable, filterable, and clickable into a working Market Detail page.

**Phase 6 — Frontend: Create Market, Portfolio & Admin Resolution**
Build: Create Market page wired to `createMarket`; Portfolio page (open positions, history, **Claim Payout** wired to `claimPayout`); Admin/Resolution page wired to `resolveMarket`.
Exit: full manual walkthrough works — create → bet → close → resolve → claim — entirely through the UI, no direct contract calls needed.

**Phase 7 — CI/CD**
Build: `.github/workflows/ci.yml` (install → compile → test on push to main); CI badge. Contract is already live from Phase 3, so nothing to deploy here — this is compile/test automation only.
Exit: CI green on a real push; frontend reachable by URL.

**Phase 8 — Documentation**
Build: `docs/USAGE.md` (what you need, step-by-step, what's proved vs. private, troubleshooting); full `README.md` (live demo link, contract address table, what-it-does, privacy model, tech stack, prerequisites, setup, tests, CI, usage link, X profile placeholder).
Exit: every mandatory README section filled — no placeholders left for contract address or demo link.

**Phase 9 — Launch Assets & Final Checklist**
Build: create + link product X profile; 3 launch tweets (what/why Midnight, technical insight, demo call-to-action); record MVP demo video; confirm 15+ meaningful commits in the actual log.
Exit — every box checked:
- [ ] Contract compiled, tested, deployed to Preprod, address in README
- [ ] Live Preprod demo link in README
- [ ] CI/CD running, badge in README
- [ ] docs/USAGE.md complete
- [ ] All 7 pages built, no stubs left
- [ ] `npm run build` zero errors
- [ ] X profile created and linked in README
- [ ] Demo video recorded
- [ ] 15+ meaningful commits

---

## PART 5 — SUBMISSION REQUIREMENTS (Level 3, for reference against Part 4)
**Requirements to pass:** working MVP live on Preprod (verifiable address) · README + setup + usage docs · CI/CD pipeline running on the repo · product X profile created and linked in README · minimum 15 meaningful commits.

**Submission checklist:** public GitHub repo with full docs · live Preprod demo link + contract address · CI/CD badge/workflow with passing runs · link to product X profile · demo video of the MVP · minimum 15 meaningful commits.
