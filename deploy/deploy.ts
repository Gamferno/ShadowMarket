import WebSocket from 'ws';
(globalThis as any).WebSocket = WebSocket;

import * as fs from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer';
import { firstValueFrom } from 'rxjs';
import { filter, timeout } from 'rxjs/operators';
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import type { UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';

import {
  deriveDeployerKeys,
  createDeployerWallet,
  buildProvidersFromWallet,
  PREPROD_CONFIG,
  type DeployerKeys
} from './utils.ts';
import { Contract, pureCircuits } from '../managed/shadowmarket/contract/index.js';
import { createWitnesses } from '../src/utils/witnesses.ts';
import { createInitialPrivateState } from '../src/utils/storage.ts';

const WALLET_FILE = path.resolve(process.cwd(), '.deployer_wallet.json');
const DEPLOYMENT_FILE = path.resolve(process.cwd(), 'deployment.json');
const SRC_CONFIG_FILE = path.resolve(process.cwd(), 'src/config/preprod-deployment.json');
const ZK_CONFIG_PATH = path.resolve(process.cwd(), 'managed/shadowmarket');

function loadOrGenerateSeed(): { seed: Uint8Array; mnemonic?: string } {
  if (fs.existsSync(WALLET_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
      if (saved.seedHex) {
        return { seed: Buffer.from(saved.seedHex, 'hex') };
      }
    } catch {
      console.warn('Could not read existing .deployer_wallet.json, generating new seed...');
    }
  }

  const seed = generateRandomSeed();
  const seedHex = Buffer.from(seed).toString('hex');
  fs.writeFileSync(WALLET_FILE, JSON.stringify({ network: 'preprod', seedHex }, null, 2));
  return { seed };
}

async function main() {
  console.log('====================================================');
  console.log('🌙 Midnight Preprod Smart Contract Deploy Tooling');
  console.log('====================================================\n');

  const { seed, mnemonic } = loadOrGenerateSeed();
  const keys: DeployerKeys = deriveDeployerKeys(seed, 'preprod');

  console.log('🔑 Deployer Wallet Details:');
  if (mnemonic) {
    console.log(`   Mnemonic:          ${mnemonic}`);
  }
  console.log(`   Unshielded Addr:   ${keys.unshieldedAddress}`);
  console.log(`   Shielded Addr:     ${keys.shieldedAddress}`);
  console.log(`   Dust Addr:         ${keys.dustAddress}\n`);

  console.log('📡 Connecting to Midnight Preprod Network...');
  const wallet = await createDeployerWallet(keys);
  const state = await wallet.waitForSyncedState();

  const NIGHT_TOKEN = ledger.nativeToken().raw;
  let nightBalance = state.unshielded.balances[NIGHT_TOKEN] ?? 0n;
  let dustBalance = state.dust.balance(new Date());

  console.log(`💰 Current Unshielded Balance: ${Number(nightBalance) / 1_000_000} tNIGHT`);
  console.log(`✨ Current DUST Fee Balance:   ${Number(dustBalance) / 1_000_000} tDUST\n`);

  if (nightBalance === 0n && dustBalance === 0n) {
    console.log('⚠️  WALLET HAS ZERO BALANCE!');
    console.log('👉 Please fund your unshielded address using the Preprod Faucet:');
    console.log(`   URL:     https://faucet.preprod.midnight.network`);
    console.log(`   Address: ${keys.unshieldedAddress}\n`);
    console.log('⏳ Waiting for incoming funds on Midnight Preprod blockchain...');

    const fundedState = await firstValueFrom(
      wallet.state().pipe(
        filter((s) => {
          const n = s.unshielded.balances[NIGHT_TOKEN] ?? 0n;
          const d = s.dust.balance(new Date());
          return n > 0n || d > 0n;
        }),
        timeout(600_000)
      )
    );

    nightBalance = fundedState.unshielded.balances[NIGHT_TOKEN] ?? 0n;
    dustBalance = fundedState.dust.balance(new Date());
    console.log(`✅ Funds received! tNIGHT: ${Number(nightBalance) / 1_000_000}, tDUST: ${Number(dustBalance) / 1_000_000}\n`);
  }

  const unregisteredNightUtxos: readonly UtxoWithMeta[] = state.unshielded.availableCoins.filter(
    (coin) => coin.utxo.type === NIGHT_TOKEN && coin.meta.registeredForDustGeneration === false
  );

  if (unregisteredNightUtxos.length > 0 && dustBalance === 0n) {
    console.log(`📝 Registering ${unregisteredNightUtxos.length} NIGHT UTXOs for DUST generation...`);
    try {
      const registrationRecipe = await wallet.registerNightUtxosForDustGeneration(
        unregisteredNightUtxos,
        keys.unshieldedKeystore.getPublicKey(),
        (payload) => keys.unshieldedKeystore.signData(payload)
      );
      const finalizedRegTx = await wallet.finalizeRecipe(registrationRecipe);
      const regTxId = await wallet.submitTransaction(finalizedRegTx);
      console.log(`🚀 Submitted DUST Registration Tx: ${regTxId}`);

      console.log('⏳ Waiting for DUST generation...');
      const finalState = await firstValueFrom(
        wallet.state().pipe(
          filter((s) => s.dust.balance(new Date()) > 0n),
          timeout(90_000)
        )
      );
      dustBalance = finalState.dust.balance(new Date());
      console.log(`✨ DUST balance generated: ${Number(dustBalance) / 1_000_000} tDUST\n`);
    } catch (e) {
      console.warn('DUST registration note:', e);
    }
  }

  console.log('⚙️  Assembling Midnight Preprod Providers & ZK Circuits...');
  const providers = buildProvidersFromWallet(wallet, ZK_CONFIG_PATH);

  const adminSecret = new Uint8Array(32).fill(1);
  const adminPk = pureCircuits.derivePublicKey(adminSecret);
  const witnesses = createWitnesses(adminSecret);
  const initialPrivateState = createInitialPrivateState(adminSecret, new Map());

  const compiledContract = CompiledContract.make('shadowmarket', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH)
  );

  const initialQuestion = 'Will Midnight Mainnet launch with native Zero-Knowledge privacy in 2026?';
  const initialCategory = 'Crypto/Macro';
  const initialResolutionSource = 'Midnight Foundation Official Consensus & Cardano Governance';
  const initialCloseTimestamp = 1798761600n;

  const initialOraclePk = { x: 0n, y: 1n };

  console.log('🔨 Executing deployContract on Midnight Preprod...');
  console.log('   Generating constructor ZK proof on proof server...');
  
  const deployed = await deployContract(providers, {
    compiledContract,
    privateStateId: 'shadowmarket_private_state',
    initialPrivateState,
    args: [adminPk, initialOraclePk, initialQuestion, initialCategory, initialResolutionSource, initialCloseTimestamp]
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  const txHash = deployed.deployTxData.public.txHash || deployed.deployTxData.public.txId;
  const blockHeight = deployed.deployTxData.public.blockHeight || 0;

  console.log('\n🎉 ====================================================');
  console.log('🎉 CONTRACT DEPLOYED ON MIDNIGHT PREPROD!');
  console.log('🎉 ====================================================');
  console.log(`📜 Contract Address: ${contractAddress}`);
  console.log(`🔗 Transaction Hash:  ${txHash}`);
  console.log(`📦 Block Height:     ${blockHeight}\n`);

  const deploymentData = {
    networkId: 'preprod',
    contractAddress,
    txHash,
    blockHeight,
    deployedAt: new Date().toISOString(),
    indexerUri: PREPROD_CONFIG.indexerHttpUrl,
    indexerWsUri: PREPROD_CONFIG.indexerWsUrl,
    nodeUri: PREPROD_CONFIG.relayURL,
    proofServerUri: PREPROD_CONFIG.provingServerUrl
  };

  fs.mkdirSync(path.dirname(SRC_CONFIG_FILE), { recursive: true });
  fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync(SRC_CONFIG_FILE, JSON.stringify(deploymentData, null, 2));
  console.log(`💾 Saved configuration to deployment.json & src/config/preprod-deployment.json`);

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Deployment Failed:', err);
  process.exit(1);
});
