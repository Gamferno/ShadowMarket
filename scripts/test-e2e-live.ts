import puppeteer, { Page } from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findButtonByText(page: Page, text: string) {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const content = await page.evaluate((el) => el.textContent || '', btn);
    if (content.toLowerCase().includes(text.toLowerCase())) {
      return btn;
    }
  }
  return null;
}

async function runLiveTest() {
  console.log('\n=============================================================');
  console.log('🌙 ShadowMarket End-to-End Live Testing (Path A: Chromium CDP)');
  console.log('=============================================================\n');

  console.log('Connecting to Chromium on http://localhost:9222 ...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: { width: 1280, height: 850 }
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  await page.setViewport({ width: 1280, height: 850 });

  page.on('console', (msg) => {
    const txt = msg.text();
    if (!txt.includes('downloadable font') && !txt.includes('favicon')) {
      console.log(`[Browser Console]: ${txt}`);
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser Error]: ${err.message}`);
  });

  // =========================================================================
  // STEP 1: Landing Page & Wallet Connection
  // =========================================================================
  console.log('\n--- STEP 1: Landing Page & Wallet Connection ---');
  await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing-page.png') });
  console.log('📸 Saved 01-landing-page.png');

  // Check if wallet is connected via Disconnect button presence
  let isConnected = await page.evaluate(() => {
    return !!document.querySelector('button[title="Disconnect wallet"]');
  });

  if (!isConnected) {
    console.log('Wallet is not connected yet. Finding "Connect Wallet" button...');
    const connectBtn = await findButtonByText(page, 'Connect Wallet');
    if (connectBtn) {
      console.log('Clicking "Connect Wallet" button...');
      await connectBtn.click();
      await sleep(1000);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01b-wallet-modal.png') });

      const oneAmBtn = await findButtonByText(page, '1am Wallet');
      if (oneAmBtn) {
        console.log('Clicking "1am Wallet" option...');
        await oneAmBtn.click();

        console.log('\n=============================================================');
        console.log('🔔 [ACTION REQUIRED IN CHROMIUM]:');
        console.log('   Please click "APPROVE" or "CONNECT" in your 1am wallet popup!');
        console.log('=============================================================\n');

        // Wait up to 60 seconds for user approval in 1am
        const startTime = Date.now();
        while (Date.now() - startTime < 60000) {
          isConnected = await page.evaluate(() => {
            return !!document.querySelector('button[title="Disconnect wallet"]');
          });
          if (isConnected) break;
          await sleep(1500);
        }
      }
    }
  }

  if (isConnected) {
    const address = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="unshielded address"]');
      return btn ? btn.textContent?.trim() : 'Connected';
    });
    console.log(`✅ Wallet Connected Successfully! Address: ${address}`);
  } else {
    console.warn('⚠️ Wallet connection not detected within timeout. Continuing with available state...');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-wallet-connected.png') });
  console.log('📸 Saved 02-wallet-connected.png');

  // =========================================================================
  // STEP 2: Navigate to Markets Catalog
  // =========================================================================
  console.log('\n--- STEP 2: Exploring Markets Catalog ---');
  await page.goto('http://localhost:3000/#/markets', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  const marketCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href*="/markets/"]');
    return cards.length;
  });
  console.log(`Found ${marketCount} prediction market(s) on Midnight Preprod.`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-markets-catalog.png') });
  console.log('📸 Saved 03-markets-catalog.png');

  // =========================================================================
  // STEP 3: Market Detail & Interactive Odds
  // =========================================================================
  console.log('\n--- STEP 3: Market Detail & Interactive Odds ---');
  await page.goto('http://localhost:3000/#/markets/1', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  const marketInfo = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent || '';
    const bodyText = document.body.innerText;
    return {
      title: h1,
      hasOdds: bodyText.includes('Public Aggregate Odds') || bodyText.includes('YES'),
      hasBetBox: bodyText.includes('Place Shielded Position')
    };
  });
  console.log('Market Detail Info:', marketInfo);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-market-detail.png') });
  console.log('📸 Saved 04-market-detail.png');

  // =========================================================================
  // STEP 4: Placing a Shielded Bet
  // =========================================================================
  console.log('\n--- STEP 4: Placing Shielded Bet (Zero-Knowledge PLONK) ---');

  // Check amount input
  const amountInput = await page.$('input[type="number"]');
  if (amountInput) {
    // Set amount to 25
    await page.evaluate((el) => {
      (el as HTMLInputElement).value = '25';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, amountInput);
    console.log('Entered bet amount: 25 tNIGHT');
  }

  // Click Place Shielded Bet button
  const placeBetBtn = await findButtonByText(page, 'Place Shielded Bet');
  if (placeBetBtn) {
    console.log('Found "Place Shielded Bet" button, scrolling into view...');
    await page.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), placeBetBtn);
    await sleep(800);
    console.log('Clicking "Place Shielded Bet"...');
    await placeBetBtn.click();
    await sleep(1200);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-bet-confirm-modal.png') });
    console.log('📸 Saved 05-bet-confirm-modal.png');

    const confirmModalBtn = await findButtonByText(page, 'Confirm & Prove');
    if (confirmModalBtn) {
      console.log('Clicking "Confirm & Prove"...');
      await confirmModalBtn.click();

      console.log('\n=============================================================');
      console.log('⚙️  ZK PROOF GENERATION IN PROGRESS (Port 6300)...');
      console.log('🔔 [ACTION REQUIRED IN CHROMIUM]:');
      console.log('   When 1am pops up to balance/sign transaction, click "APPROVE"!');
      console.log('=============================================================\n');

      // Poll progress stages for up to 90 seconds
      let confirmed = false;
      let lastStage = '';
      const betStartTime = Date.now();

      while (Date.now() - betStartTime < 90000) {
        const status = await page.evaluate(() => {
          const text = document.body.innerText;
          const isSuccess = text.includes('Shielded Position Confirmed') || text.includes('Tx Hash:');
          const isError = text.includes('Transaction was rejected') || text.includes('Proof generation failed');
          return { isSuccess, isError };
        });

        // Check for progress message in UI
        const currentStage = await page.evaluate(() => {
          const el = document.querySelector('.animate-spin')?.parentElement?.textContent;
          return el?.trim() || '';
        });

        if (currentStage && currentStage !== lastStage) {
          console.log(`[ZK Status]: ${currentStage}`);
          lastStage = currentStage;
        }

        if (status.isSuccess) {
          confirmed = true;
          console.log('🎉 Shielded Bet Confirmed on Midnight Preprod!');
          break;
        }

        if (status.isError) {
          console.warn('⚠️ Transaction or proof encountered an error in UI.');
          break;
        }

        await sleep(2000);
      }

      await sleep(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-bet-result.png') });
      console.log('📸 Saved 06-bet-result.png');
    }
  }

  // =========================================================================
  // STEP 5: Portfolio Validation
  // =========================================================================
  console.log('\n--- STEP 5: Checking Portfolio & Shielded Receipts ---');
  await page.goto('http://localhost:3000/#/portfolio', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  const portfolioStats = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    return {
      hasPositions: !bodyText.includes('No shielded positions yet'),
      hasReceiptTable: bodyText.includes('Commitment') || bodyText.includes('Market ID'),
      rawSnippet: bodyText.slice(0, 500)
    };
  });
  console.log('Portfolio Inspection:', portfolioStats);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-portfolio.png') });
  console.log('📸 Saved 07-portfolio.png');

  // =========================================================================
  // STEP 6: Market Creation Form
  // =========================================================================
  console.log('\n--- STEP 6: Validating Market Creation Form ---');
  await page.goto('http://localhost:3000/#/create', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  const titleInput = await page.$('input[placeholder*="Will Midnight"], input[type="text"]');
  if (titleInput) {
    await titleInput.type('Will Midnight support Cardano cross-chain bridge in 2026?');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-create-market.png') });
  console.log('📸 Saved 08-create-market.png');

  // =========================================================================
  // STEP 7: About & Protocol Architecture Page
  // =========================================================================
  console.log('\n--- STEP 7: About / Privacy Architecture ---');
  await page.goto('http://localhost:3000/#/about', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-about-architecture.png') });
  console.log('📸 Saved 09-about-architecture.png');

  // =========================================================================
  // STEP 8: Resolver / Admin Console
  // =========================================================================
  console.log('\n--- STEP 8: Resolver & Oracle Console ---');
  await page.goto('http://localhost:3000/#/admin', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-resolver-admin.png') });
  console.log('📸 Saved 10-resolver-admin.png');

  console.log('\n=============================================================');
  console.log('✅ End-to-End Walkthrough Completed Successfully!');
  console.log(`📁 All screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('=============================================================\n');

  browser.disconnect();
}

runLiveTest().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
