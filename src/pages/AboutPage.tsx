import React, { useState } from 'react';
import preprodConfig from '../config/preprod-deployment.json';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How are aggregate odds calculated if individual bets are secret?',
    a: 'When you submit a bet, your machine generates a Zero-Knowledge PLONK proof demonstrating that your bet is valid and satisfies contract constraints. The circuit discloses only the aggregate addition to the market stake pool without revealing your side choice or position size.'
  },
  {
    q: 'Can miners, validators, or other bettors front-run or copy-trade my bets?',
    a: 'No. On transparent blockchains like Ethereum or Solana, every transaction reveals the bettor identity, choice, and amount before confirmation, enabling MEV bots and copy-traders to exploit large positions. On Midnight, the contents of your bet are mathematically hidden inside a persistent cryptographic commitment.'
  },
  {
    q: 'How does anonymous payout claiming work?',
    a: 'When a market closes and resolves, winning bettors construct a ZK proof using their locally stored private receipt. The smart contract validates that the commitment matches the winning side and burns a one-time nullifier. The nullifier guarantees you cannot claim twice, while zero-knowledge cryptography prevents anyone from linking your claim to your original bet.'
  },
  {
    q: 'Where does zero-knowledge proof generation happen?',
    a: 'Proof generation happens locally on your computer via the Midnight Proof Server (running in Docker on localhost:6300) or delegated to your Midnight wallet. Your private secret keys never leave your device.'
  },
  {
    q: 'What network is ShadowMarket deployed on?',
    a: `ShadowMarket is live on the Midnight Preprod Network. The smart contract address is ${preprodConfig.contractAddress}, deployed at block #${preprodConfig.deployedAtBlock}.`
  }
];

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-fadeIn py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-full font-mono">
          Protocol Architecture &amp; Privacy Model
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          How ShadowMarket Works
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ShadowMarket combines the predictive power of decentralized prediction markets with the mathematical privacy of Zero-Knowledge cryptography on Midnight.
        </p>
      </div>

      {/* Comparison Table: Polymarket vs ShadowMarket */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100">
            Transparent Markets vs ShadowMarket
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Why prediction markets require privacy to prevent front-running, censorship, and market manipulation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">Dimension</th>
                <th className="pb-3 font-semibold text-rose-400">Transparent (Polymarket / EVM)</th>
                <th className="pb-3 font-semibold text-emerald-400">ShadowMarket (Midnight ZK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-3 font-sans font-medium text-slate-200">Individual Bet Sizes</td>
                <td className="py-3 text-rose-400/90">Public on ledger</td>
                <td className="py-3 text-emerald-400 font-semibold">100% Shielded (ZK Commitment)</td>
              </tr>
              <tr>
                <td className="py-3 font-sans font-medium text-slate-200">Bettor Choice (YES / NO)</td>
                <td className="py-3 text-rose-400/90">Public in mempool &amp; state</td>
                <td className="py-3 text-emerald-400 font-semibold">Private to the bettor</td>
              </tr>
              <tr>
                <td className="py-3 font-sans font-medium text-slate-200">Copy-Trading &amp; Front-Running</td>
                <td className="py-3 text-rose-400/90">High vulnerability (MEV bots)</td>
                <td className="py-3 text-emerald-400 font-semibold">Eliminated (Zero MEV)</td>
              </tr>
              <tr>
                <td className="py-3 font-sans font-medium text-slate-200">Proof of Odds Integrity</td>
                <td className="py-3 text-slate-400">Public balance sum</td>
                <td className="py-3 text-cyan-400 font-semibold">Compact ZK Tally Circuit</td>
              </tr>
              <tr>
                <td className="py-3 font-sans font-medium text-slate-200">Payout Claims</td>
                <td className="py-3 text-rose-400/90">Tied to original bettor address</td>
                <td className="py-3 text-emerald-400 font-semibold">Anonymous Nullifier Scheme</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 3 Execution Boundaries */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-100">
          The Three Execution Boundaries of Midnight
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400">
              1
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Local Witness Boundary</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Operates entirely inside your browser. Stores your private user secret, bet nonces, and position receipts in encrypted client storage. Never touches the blockchain.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center font-bold text-purple-400">
              2
            </div>
            <h3 className="font-bold text-slate-200 text-sm">ZK Circuit Boundary</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              PLONK constraint system compiled via Midnight Compact Dev Tools. Verifies mathematical relations (solvency, odds, nullifiers) and outputs succinct zero-knowledge proofs.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400">
              3
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Public Ledger Boundary</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Substrate-based Midnight Preprod blockchain. Stores market metadata, verified aggregate odds, and spent nullifier sets. Finalizes transactions irreversibly.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-100">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-slate-800/80">
          {FAQS.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between text-left font-semibold text-slate-200 text-sm hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-500 font-mono ml-4 text-xs">
                  {openFaq === index ? '▲' : '▼'}
                </span>
              </button>

              {openFaq === index && (
                <p className="mt-2 text-xs text-slate-400 leading-relaxed pr-6 animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
