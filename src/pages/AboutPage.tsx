import React, { useState } from 'react';
import preprodConfig from '../config/preprod-deployment.json';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How are aggregate odds calculated if individual bets are secret?',
    a: 'When you submit an order, your browser generates a client-side Zero-Knowledge PLONK proof demonstrating that your position is valid and satisfies contract constraints. The circuit discloses only the aggregate addition to the market stake pool without revealing your side choice or position size.'
  },
  {
    q: 'Can miners, validators, or other traders front-run or copy-trade my bets?',
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
    a: `ShadowMarket is live on the Midnight Preprod Network with verified contract deployment (Block #${preprodConfig.deployedAtBlock}).`
  }
];

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4 font-sans">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13151A] border border-[#252832] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          <span className="text-[#FBBF24] font-medium">PLONK Zero-Knowledge</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#94A3B8]">Confidential Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Confidential Execution Architecture
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          ShadowMarket combines intuitive liquidity with the mathematical privacy of Zero-Knowledge cryptography on Midnight Network.
        </p>
      </div>

      {/* 2. Comparison Table: Transparent vs Confidential */}
      <div className="bg-[#13151A] border border-[#252832] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="border-b border-[#252832] pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Transparent Markets vs ShadowMarket on Midnight
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 font-medium">
              100% MEV-Immune
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Why prediction markets require zero-knowledge privacy to prevent front-running, copy-trading, and wallet profiling.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252832] text-[#94A3B8] text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Architectural Dimension</th>
                <th className="pb-3 font-semibold text-[#F59E0B]">Transparent (EVM / Solana)</th>
                <th className="pb-3 font-semibold text-[#0EA5E9]">ShadowMarket (Confidential)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252832] text-[#94A3B8]">
              <tr>
                <td className="py-3 font-medium text-white">Individual Bet Sizes</td>
                <td className="py-3 text-[#F59E0B]">Plaintext on ledger</td>
                <td className="py-3 text-[#0EA5E9] font-semibold">100% Shielded (ZK Commitment)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Trader Choice (YES / NO)</td>
                <td className="py-3 text-[#F59E0B]">Exposed in mempool &amp; state</td>
                <td className="py-3 text-[#0EA5E9] font-semibold">Sealed locally in client witness</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Copy-Trading &amp; Front-Running</td>
                <td className="py-3 text-[#F59E0B]">High vulnerability (MEV searchers)</td>
                <td className="py-3 text-[#0EA5E9] font-semibold">Mathematically eliminated</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Proof of Odds Integrity</td>
                <td className="py-3 text-white">Public balance sum</td>
                <td className="py-3 text-[#0EA5E9] font-semibold">Compact ZK Tally Circuit</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Payout Claims</td>
                <td className="py-3 text-[#F59E0B]">Linked to original bettor address</td>
                <td className="py-3 text-[#0EA5E9] font-semibold">Anonymous Nullifier Scheme</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. The 3 Execution Boundaries */}
      <div className="bg-[#13151A] border border-[#252832] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <h2 className="text-lg font-bold text-white border-b border-[#252832] pb-4">
          The Three Execution Boundaries of Midnight
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0A0B0D] p-5 rounded-xl border border-[#252832] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center font-bold text-[#F59E0B]">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Local Client Witness</h3>
            <p className="text-[#94A3B8] leading-relaxed text-xs">
              Operates entirely inside your browser. Stores your private user secret, bet nonces, and position receipts in encrypted client storage. Never touches the blockchain.
            </p>
          </div>

          <div className="bg-[#0A0B0D] p-5 rounded-xl border border-[#252832] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center font-bold text-[#FBBF24]">
              2
            </div>
            <h3 className="font-bold text-white text-sm">ZK Circuit Boundary</h3>
            <p className="text-[#94A3B8] leading-relaxed text-xs">
              PLONK constraint system compiled via Midnight Compact Dev Tools. Verifies mathematical relations (solvency, odds, nullifiers) and outputs succinct zero-knowledge proofs.
            </p>
          </div>

          <div className="bg-[#0A0B0D] p-5 rounded-xl border border-[#252832] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center font-bold text-[#F59E0B]">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Public Ledger Boundary</h3>
            <p className="text-[#94A3B8] leading-relaxed text-xs">
              Substrate-based Midnight Preprod blockchain. Stores market metadata, verified aggregate odds, and spent nullifier sets. Finalizes transactions irreversibly.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQ Accordion */}
      <div className="bg-[#13151A] border border-[#252832] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <h2 className="text-lg font-bold text-white border-b border-[#252832] pb-4">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-[#252832]">
          {FAQS.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between text-left font-semibold text-white text-sm hover:text-[#F59E0B] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-[#94A3B8] font-semibold ml-4 text-sm">
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>

              {openFaq === index && (
                <p className="mt-2.5 text-xs text-[#94A3B8] leading-relaxed pr-6">
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
