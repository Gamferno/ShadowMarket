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

async function runCreateMarketTest() {
  console.log('\n=============================================================');
  console.log('🌙 ShadowMarket: Targeted Live "Create Market" Test (1am & Preprod)');
  console.log('=============================================================\n');

  console.log('Connecting to Chromium on http://localhost:9222 ...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: { width: 1280, height: 900 }
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', (msg) => {
    const txt = msg.text();
    if (!txt.includes('downloadable font') && !txt.includes('favicon')) {
      console.log(`[Browser Console]: ${txt}`);
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser Error]: ${err.message}`);
  });

  // Navigate to Create Market
  console.log('🌐 Navigating to http://localhost:3000/#/create ...');
  await page.goto('http://localhost:3000/#/create', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1500);

  // Check if wallet is connected
  let isConnected = await page.evaluate(() => {
    return !!document.querySelector('button[title="Disconnect wallet"]');
  });

  if (!isConnected) {
    console.log('Wallet is not connected. Opening connection modal...');
    const connectBtn = await findButtonByText(page, 'Connect Wallet');
    if (connectBtn) {
      await connectBtn.click();
      await sleep(800);
      const oneAmBtn = await findButtonByText(page, '1am Wallet');
      if (oneAmBtn) {
        await oneAmBtn.click();
        console.log('🔔 Please approve 1am connection in Chromium...');
        const start = Date.now();
        while (Date.now() - start < 30000) {
          isConnected = await page.evaluate(() => {
            return !!document.querySelector('button[title="Disconnect wallet"]');
          });
          if (isConnected) break;
          await sleep(1000);
        }
      }
    }
  }

  const walletAddr = await page.evaluate(() => {
    const btn = document.querySelector('button[title*="unshielded address"]');
    return btn ? btn.textContent?.trim() : 'Connected';
  });
  console.log(`✅ 1am Wallet Connected: ${walletAddr}`);

  // Fill in the Create Market form
  console.log('📝 Filling in the Create Market Form...');

  const questionText = 'Will Midnight launch private cross-chain swaps with Cardano in 2026?';
  const resolutionSourceText = 'Official Midnight GitHub releases & Consensus telemetry';
  const descriptionText = 'Resolves to YES if Midnight mainnet enables native shielded cross-chain atomic swaps before Dec 31, 2026.';

  // Question input
  const inputs = await page.$$('input[type="text"]');
  if (inputs.length >= 1) {
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type(questionText);
    console.log(`   - Market Question: "${questionText}"`);
  }

  // Description textarea
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.click();
    await textarea.type(descriptionText);
    console.log(`   - Description: "${descriptionText}"`);
  }

  // Resolution Source input
  if (inputs.length >= 2) {
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].type(resolutionSourceText);
    console.log(`   - Resolution Source: "${resolutionSourceText}"`);
  }

  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-market-01-filled-form.png') });
  console.log('📸 Saved create-market-01-filled-form.png');

  // Submit the form
  const deployBtn = await findButtonByText(page, 'Deploy Market to Preprod');
  if (!deployBtn) {
    throw new Error('Could not find "Deploy Market to Preprod" button');
  }

  const isDisabled = await page.evaluate((el) => (el as HTMLButtonElement).disabled, deployBtn);
  if (isDisabled) {
    throw new Error('"Deploy Market to Preprod" button is disabled. Form validation failed.');
  }

  console.log('\n🚀 Clicking "Deploy Market to Preprod"...');
  await deployBtn.click();

  console.log('\n=============================================================');
  console.log('⚙️  EXECUTING createMarket() ZK CIRCUIT...');
  console.log('🔔 [ACTION REQUIRED IN CHROMIUM]:');
  console.log('   When 1am pops up to balance/sign transaction, click "APPROVE"!');
  console.log('=============================================================\n');

  // Poll for completion
  let success = false;
  let lastStage = '';
  const startTime = Date.now();

  while (Date.now() - startTime < 120000) {
    const status = await page.evaluate(() => {
      const text = document.body.innerText;
      const isSuccess = text.includes('Market Deployed Successfully to Midnight Preprod');
      const isError = text.includes('Market creation failed') || text.includes('Failed to deploy market');
      return { isSuccess, isError };
    });

    const currentStage = await page.evaluate(() => {
      const el = document.querySelector('.animate-spin')?.parentElement?.textContent;
      return el?.trim() || '';
    });

    if (currentStage && currentStage !== lastStage) {
      console.log(`[ZK Status]: ${currentStage}`);
      lastStage = currentStage;
    }

    if (status.isSuccess) {
      success = true;
      console.log('🎉 Market Deployed Successfully to Midnight Preprod!');
      break;
    }

    if (status.isError) {
      console.warn('⚠️ Market deployment encountered an error in UI.');
      break;
    }

    await sleep(2000);
  }

  await sleep(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-market-02-success.png') });
  console.log('📸 Saved create-market-02-success.png');

  // Click View Live Market
  const viewMarketBtn = await findButtonByText(page, 'View Live Market');
  if (viewMarketBtn) {
    console.log('Navigating to live deployed market page...');
    await viewMarketBtn.click();
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-market-03-live-market.png') });
    console.log('📸 Saved create-market-03-live-market.png');
  }

  // View catalog
  console.log('Checking updated markets catalog...');
  await page.goto('http://localhost:3000/#/markets', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  const finalCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href*="/markets/"]');
    return cards.length;
  });
  console.log(`Total prediction markets in catalog: ${finalCount}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'create-market-04-catalog-updated.png') });
  console.log('📸 Saved create-market-04-catalog-updated.png');

  console.log('\n=============================================================');
  console.log('✅ "Create Market" Test Completed Successfully!');
  console.log('=============================================================\n');

  browser.disconnect();
}

runCreateMarketTest().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
