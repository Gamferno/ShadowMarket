import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer-core';

const CDP_URL = 'http://localhost:9222';
const DAPP_URL = 'http://localhost:3000';
const OUTPUT_FILE = path.resolve(process.cwd(), 'public/shadowmarket-live-demo.mp4');
const ARTIFACT_DIR = '/home/om/.gemini/antigravity-cli/brain/e42b1735-1032-4f11-a917-b8aa91592cfd';
const ARTIFACT_FILE = path.resolve(ARTIFACT_DIR, 'shadowmarket-live-demo.mp4');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printBanner(title: string, message: string) {
  const line = '═'.repeat(65);
  console.log(`\n\x1b[1;33m╔${line}╗\x1b[0m`);
  console.log(`\x1b[1;33m║\x1b[0m  \x1b[1;37m${title.padEnd(61)}\x1b[0m \x1b[1;33m║\x1b[0m`);
  console.log(`\x1b[1;33m╠${line}╣\x1b[0m`);
  console.log(`\x1b[1;33m║\x1b[0m  \x1b[1;32m${message.padEnd(61)}\x1b[0m \x1b[1;33m║\x1b[0m`);
  console.log(`\x1b[1;33m╚${line}╝\x1b[0m\n`);
}

async function findButtonByText(page: Page, text: string) {
  const buttons = await page.$$('button, a');
  for (const btn of buttons) {
    const content = await page.evaluate((el) => el.textContent || '', btn);
    if (content.toLowerCase().includes(text.toLowerCase())) {
      return btn;
    }
  }
  return null;
}

async function main() {
  console.log('\n🎬 ==============================================================');
  console.log('🌙 ShadowMarket: Collaborative Live Demo Recording');
  console.log('   Wayland Screen Recording (wf-recorder) + Live 1AM Wallet');
  console.log('==============================================================\n');

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  }

  // 1. Start wf-recorder for Wayland desktop capture
  console.log('🎥 Starting Wayland desktop screen recording (eDP-1)...');
  console.log(`   Output target: ${OUTPUT_FILE}\n`);

  const wfArgs = [
    '-o', 'eDP-1',
    '-f', OUTPUT_FILE,
    '-c', 'libx264',
    '-x', 'yuv420p',
    '-p', 'preset=veryfast',
    '-p', 'crf=20',
    '-y'
  ];

  const recorder = spawn('wf-recorder', wfArgs);

  recorder.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('error') || msg.includes('Error')) {
      console.warn('[wf-recorder]:', msg.trim());
    }
  });

  const stopRecorder = async () => {
    console.log('\n🛑 Stopping screen recorder...');
    recorder.kill('SIGINT');
    await new Promise<void>((resolve) => {
      recorder.on('close', () => {
        console.log('✅ Screen recording finished and container closed.');
        resolve();
      });
      // Safety timeout
      setTimeout(resolve, 4000);
    });
  };

  process.on('SIGINT', async () => {
    await stopRecorder();
    process.exit(0);
  });

  // 2. Connect to Chromium via CDP
  console.log(`🔌 Connecting to Chromium at ${CDP_URL}...`);
  let browser: Browser | null = null;
  const connectStartTime = Date.now();

  while (!browser && Date.now() - connectStartTime < 60000) {
    try {
      browser = await puppeteer.connect({
        browserURL: CDP_URL,
        defaultViewport: null
      });
    } catch {
      process.stdout.write('.');
      await sleep(1500);
    }
  }

  if (!browser) {
    await stopRecorder();
    throw new Error(
      `\n❌ Could not connect to Chromium on ${CDP_URL}.\n` +
      `   Please launch Chromium with: chromium --remote-debugging-port=9222 http://localhost:3000\n`
    );
  }

  console.log('\n✅ Successfully connected to live Chromium session!');

  // 3. Locate or open the DApp page
  const pages = await browser.pages();
  let page = pages.find((p) => p.url().includes('localhost:3000'));

  if (!page) {
    console.log(`🌐 Navigating active tab to ${DAPP_URL}/#/ ...`);
    page = pages[0] || (await browser.newPage());
    await page.goto(`${DAPP_URL}/#/`, { waitUntil: 'networkidle0' });
  } else {
    console.log(`📍 Found existing ShadowMarket tab: ${page.url()}`);
    await page.bringToFront();
    await page.goto(`${DAPP_URL}/#/`, { waitUntil: 'networkidle0' });
  }

  await sleep(2000);

  // =========================================================================
  // SCENE 1: Introduction & Homepage Showcase
  // =========================================================================
  console.log('\n--- 📽️  SCENE 1: Homepage Showcase & Preprod Interface ---');
  await sleep(1500);

  // Smooth scroll through markets directory
  console.log('   Browsing markets directory...');
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(2000);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(2000);

  // =========================================================================
  // SCENE 2: Live 1AM Wallet Connection
  // =========================================================================
  console.log('\n--- 📽️  SCENE 2: Live 1AM Wallet Connection ---');

  // Ensure disconnected first so we record the full Connect Wallet interaction
  const alreadyConnected = await page.evaluate(() => {
    return !!document.querySelector('button[title="Disconnect wallet"]');
  });

  if (alreadyConnected) {
    console.log('   Resetting wallet session to showcase full Connect Wallet flow...');
    const dcBtn = await page.$('button[title="Disconnect wallet"]');
    if (dcBtn) {
      await dcBtn.click();
      await sleep(1500);
    }
  }

  let isConnected = false;
  console.log('   Clicking "Connect Wallet" button...');
  const connectBtn = await findButtonByText(page, 'Connect Wallet');
  if (connectBtn) {
    await connectBtn.click();
    await sleep(1200);

    const oneAmBtn = await findButtonByText(page, '1am Wallet');
    if (oneAmBtn) {
      console.log('   Selecting "1am Wallet" option...');
      await oneAmBtn.click();

      printBanner(
        '🔔 ACTION REQUIRED IN 1AM WALLET POPUP',
        'Please click "APPROVE" / "CONNECT" in your 1AM extension!'
      );

      // Wait for user to approve in 1AM
      const waitStart = Date.now();
      while (Date.now() - waitStart < 90000) {
        isConnected = await page.evaluate(() => {
          return !!document.querySelector('button[title="Disconnect wallet"]');
        });
        if (isConnected) break;
        await sleep(1000);
      }
    }
  }

  if (isConnected) {
    const address = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="address"], button[title*="copy"]');
      return btn ? btn.textContent?.trim() : 'Connected';
    });
    console.log(`\n🎉 \x1b[1;32m1AM Wallet Connected Successfully!\x1b[0m Address: ${address}`);
    await sleep(3500); // Hold on connected state in recording
  } else {
    console.warn('⚠️ Wallet connection not detected within timeout, proceeding with session...');
  }

  // =========================================================================
  // Helper to type into input cleanly
  const typeInto = async (selector: string, text: string, delay = 25) => {
    const el = await page.$(selector);
    if (!el) {
      console.warn(`Element not found for selector: ${selector}`);
      return false;
    }
    await el.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await el.type(text, { delay });
    return true;
  };

  // =========================================================================
  // SCENE 3: Permissionless Market Creation (Live)
  // =========================================================================
  console.log('\n--- 📽️  SCENE 3: Permissionless Market Creation ---');
  console.log('   Navigating to Create Market...');
  await page.goto(`${DAPP_URL}/#/create`, { waitUntil: 'networkidle0' });
  await sleep(2000);

  const questionText = 'Will Midnight testnet achieve sub-second ZK proof generation in 2026?';
  const descriptionText = 'Resolves to YES if official Midnight benchmark demonstrates client-side PLONK proving under 1000ms.';
  const resolutionSourceText = 'Official Midnight Foundation Consensus & Explorer Telemetry';

  console.log(`   Entering Proposition: "${questionText}"`);
  await typeInto('input[placeholder*="Will Midnight launch"]', questionText, 30);
  await sleep(800);

  // Select Category "Crypto/Macro"
  const catBtn = await findButtonByText(page, 'Crypto/Macro');
  if (catBtn) {
    await catBtn.click();
    await sleep(800);
  }

  console.log(`   Entering Resolution Criteria: "${descriptionText}"`);
  const descTextarea = await page.$('textarea');
  if (descTextarea) {
    await descTextarea.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await descTextarea.type(descriptionText, { delay: 20 });
    await sleep(800);
  }

  console.log(`   Entering Resolution Source: "${resolutionSourceText}"`);
  await typeInto('input[placeholder*="Official Midnight Consensus"]', resolutionSourceText, 25);
  await sleep(1000);

  // Scroll down to preview and submit button
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await sleep(1500);

  // Verify form readiness and wait for enabled deploy button
  console.log('   Verifying market form validation...');
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    return btn && !btn.disabled;
  }, { timeout: 10000 });

  console.log('   Clicking "Deploy Market to Preprod →"...');
  const deployBtn = await page.$('button[type="submit"]');
  if (deployBtn) {
    await deployBtn.click();

    printBanner(
      '🔔 ACTION REQUIRED IN 1AM WALLET POPUP',
      'Please click "APPROVE" to confirm deploying Market to Preprod!'
    );

    // Wait for deployment confirmation
    const deployStart = Date.now();
    while (Date.now() - deployStart < 120000) {
      const status = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          isSuccess: text.includes('Market Deployed Successfully') || text.includes('Market ID:'),
          isError: text.includes('failed') || text.includes('rejected')
        };
      });

      if (status.isSuccess) {
        console.log('\n🎉 \x1b[1;32mMarket Successfully Deployed on Midnight Preprod!\x1b[0m');
        break;
      }
      if (status.isError) {
        console.warn('⚠️ Market deployment reported an error or rejection in UI.');
        break;
      }
      await sleep(1500);
    }

    await sleep(3500); // Hold on success notification
  }

  // =========================================================================
  // SCENE 4: Live Confidential Prediction (Shielded Bet with 1AM)
  // =========================================================================
  console.log('\n--- 📽️  SCENE 4: Live Confidential Prediction (Shielded Bet) ---');
  console.log('   Navigating to Market #1 detail page...');
  await page.goto(`${DAPP_URL}/#/markets/1`, { waitUntil: 'networkidle0' });
  await sleep(2500);

  // Toggle order slip options (Yes/No buttons)
  const yesBtn = await findButtonByText(page, 'Yes');
  const noBtn = await findButtonByText(page, 'No');

  if (noBtn) {
    console.log('   Highlighting "No" outcome...');
    await noBtn.click();
    await sleep(1200);
  }
  if (yesBtn) {
    console.log('   Selecting "Yes" outcome...');
    await yesBtn.click();
    await sleep(1200);
  }

  // Set stake amount to 100 tDUST
  console.log('   Setting stake amount to 100 tDUST...');
  const amountInput = await page.$('input[type="number"]');
  if (amountInput) {
    await amountInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await amountInput.type('100', { delay: 40 });
    await sleep(1500);
  }

  // Click "Buy Yes" button
  console.log('   Submitting shielded prediction order...');
  const buyBtn = (await findButtonByText(page, 'Buy Yes')) || (await findButtonByText(page, 'Deterministic On-Chain Escrow Settlement'));
  if (buyBtn) {
    await buyBtn.click();

    printBanner(
      '🔔 ACTION REQUIRED IN 1AM WALLET POPUP',
      'Please click "APPROVE" / "SIGN" to place your Shielded Prediction!'
    );

    // Wait for bet confirmation
    const betStart = Date.now();
    while (Date.now() - betStart < 120000) {
      const status = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          isSuccess:
            text.includes('Order Placed & Escrow Settled!') ||
            text.includes('Receipt:') ||
            text.includes('Shielded Position Confirmed'),
          isError: text.includes('Transaction was rejected') || text.includes('failed')
        };
      });

      if (status.isSuccess) {
        console.log('\n🎉 \x1b[1;32mShielded Bet Confirmed on Midnight Preprod!\x1b[0m');
        break;
      }
      if (status.isError) {
        console.warn('⚠️ Bet placement reported an error in UI.');
        break;
      }
      await sleep(1500);
    }

    await sleep(5000); // Hold on confirmed cryptographic commitment
  }

  // =========================================================================
  // SCENE 5: Shielded Portfolio Vault & Outro
  // =========================================================================
  console.log('\n--- 📽️  SCENE 5: Shielded Portfolio Vault & Private Receipts ---');
  console.log('   Navigating to Portfolio Vault...');
  await page.goto(`${DAPP_URL}/#/portfolio`, { waitUntil: 'networkidle0' });
  await sleep(2500);

  // Smooth scroll through private vault
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await sleep(4000); // Hold on private vault and cryptographic receipts

  console.log('\n🎬 All scenes completed successfully!');

  // Stop screen recorder and finalize MP4
  await stopRecorder();

  // Copy to Artifact directory
  try {
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }
    fs.copyFileSync(OUTPUT_FILE, ARTIFACT_FILE);
    console.log(`📋 Copied video artifact to: ${ARTIFACT_FILE}`);
  } catch (err) {
    console.warn('Could not copy to artifact directory:', err);
  }

  // Disconnect CDP session and cleanly exit
  if (browser) {
    await browser.disconnect();
  }

  console.log(`\n🎉 Live collaborative demo video ready: ${OUTPUT_FILE}\n`);
  process.exit(0);
}

main().catch(async (err) => {
  console.error('\n❌ Error during live collaborative demo recording:', err);
  process.exit(1);
});
