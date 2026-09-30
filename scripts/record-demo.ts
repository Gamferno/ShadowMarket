import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer, { Page } from 'puppeteer-core';

const BASE_URL = 'http://127.0.0.1:3000';
const OUTPUT_FILE = path.resolve(process.cwd(), 'public/shadowmarket-demo.mp4');
const ARTIFACT_DIR = '/home/om/.gemini/antigravity-cli/brain/e42b1735-1032-4f11-a917-b8aa91592cfd';
const ARTIFACT_FILE = path.resolve(ARTIFACT_DIR, 'shadowmarket-demo.mp4');

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

async function recordDemo() {
  console.log('🎬 Starting ShadowMarket Demo Video Recording...');
  console.log(`Resolution: ${WIDTH}x${HEIGHT} @ ${FPS}fps`);
  console.log(`Target: ${OUTPUT_FILE}\n`);

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  }

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', `${FPS}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '20',
    OUTPUT_FILE
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('error') || msg.includes('Error')) {
      console.warn('ffmpeg stderr:', msg.trim());
    }
  });

  const writeFrame = async (page: Page, count: number = 1): Promise<void> => {
    const screenshot = await page.screenshot({ type: 'png', omitBackground: false });
    for (let i = 0; i < count; i++) {
      if (!ffmpeg.stdin.write(screenshot)) {
        await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
      }
    }
  };

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--disable-web-security'
    ],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Pre-inject CAIP-372 window.midnight mock for deterministic demo recording
  await page.evaluateOnNewDocument(() => {
    try {
      window.localStorage.removeItem('shadowmarket_shielded_receipts_v1');
      window.localStorage.removeItem('shadowmarket_created_markets_v1');
      window.localStorage.removeItem('shadowmarket_market_overrides_v1');
    } catch {
      // ignore
    }

    (window as any).midnight = {
      '1am': {
        name: '1am Wallet',
        rdns: 'midnight.1am',
        connect: async () => {
          return {
            getUnshieldedAddress: async () => ({
              unshieldedAddress: 'mn1q8a92f76c0e4d1b8c27a94ef19c30d84a7e2b4'
            }),
            getShieldedAddresses: async () => ({
              shieldedAddress: 'mn_shielded1qqg8w9v58u4u3q9fjl6e9u9e',
              shieldedCoinPublicKey: '00'.repeat(32),
              shieldedEncryptionPublicKey: '00'.repeat(32)
            }),
            signData: async () => '0xmock_signature_1am',
            balanceUnsealedTransaction: async () => ({ tx: '00' }),
            submitTransaction: async () => '0xmock_tx_hash'
          };
        }
      }
    };
  });

  const injectCursor = async () => {
    await page.evaluate(() => {
      if (document.getElementById('demo-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.45)';
      cursor.style.border = '2.5px solid #F59E0B';
      cursor.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.7)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '999999';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'transform 0.08s ease-out';
      cursor.style.left = '960px';
      cursor.style.top = '540px';

      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.top = '50%';
      dot.style.left = '50%';
      dot.style.width = '6px';
      dot.style.height = '6px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = '#FFFFFF';
      dot.style.transform = 'translate(-50%, -50%)';
      cursor.appendChild(dot);

      document.body.appendChild(cursor);
    });
  };

  let curX = 960;
  let curY = 540;

  const moveCursorTo = async (targetX: number, targetY: number, steps: number = 8) => {
    const startX = curX;
    const startY = curY;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      curX = startX + (targetX - startX) * ease;
      curY = startY + (targetY - startY) * ease;

      await page.evaluate((x, y) => {
        const el = document.getElementById('demo-cursor');
        if (el) {
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
        }
      }, curX, curY);

      await writeFrame(page, 1);
    }
    curX = targetX;
    curY = targetY;
  };

  const clickAt = async (targetX: number, targetY: number) => {
    await moveCursorTo(targetX, targetY, 6);

    await page.evaluate(() => {
      const el = document.getElementById('demo-cursor');
      if (el) el.style.transform = 'translate(-50%, -50%) scale(0.7)';
    });
    await writeFrame(page, 2);

    await page.mouse.click(targetX, targetY);

    await page.evaluate(() => {
      const el = document.getElementById('demo-cursor');
      if (el) el.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    await writeFrame(page, 3);
  };

  const getElementCenterByText = async (text: string, tag: string = 'button'): Promise<{ x: number; y: number } | null> => {
    return page.evaluate((t, tagName) => {
      const elements = Array.from(document.querySelectorAll(tagName));
      const match = elements.find((el) => el.textContent?.trim().toLowerCase().includes(t.toLowerCase()));
      if (!match) return null;
      const rect = match.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }, text, tag);
  };

  const getElementCenterBySelector = async (selector: string): Promise<{ x: number; y: number } | null> => {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }, selector);
  };

  const typeSmoothly = async (selector: string, text: string) => {
    const pos = await getElementCenterBySelector(selector);
    if (pos) {
      await clickAt(pos.x, pos.y);
    }
    // Type in chunks with frames
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(0, i + 3);
      await page.evaluate((sel, val) => {
        const inp = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement;
        if (inp) {
          inp.value = val;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, selector, chunk);
      await writeFrame(page, 1);
    }
    await writeFrame(page, 3);
  };

  // ==========================================
  // SCENE 1: Landing Page Showcase (Clean UI)
  // ==========================================
  console.log('📽️  Scene 1: Landing Page Showcase (Clean UI)...');
  await page.goto(`${BASE_URL}/#/`, { waitUntil: 'networkidle0' });
  await injectCursor();
  await writeFrame(page, 15);

  // Hover over brand logo
  await moveCursorTo(180, 32, 10);
  await writeFrame(page, 10);

  // Hover over "Preprod Live" network badge
  const preprodBadge = await getElementCenterByText('Preprod Live', 'div');
  if (preprodBadge) {
    await moveCursorTo(preprodBadge.x, preprodBadge.y, 8);
    await writeFrame(page, 10);
  }

  // Hover over Featured Breaking Market Card
  await moveCursorTo(960, 220, 10);
  await writeFrame(page, 15);

  // Scroll down smoothly to show trending markets
  for (let s = 0; s < 3; s++) {
    await page.evaluate(() => window.scrollBy({ top: 140, behavior: 'smooth' }));
    await writeFrame(page, 3);
  }
  await writeFrame(page, 10);

  // Scroll back to top
  for (let s = 0; s < 3; s++) {
    await page.evaluate(() => window.scrollBy({ top: -140, behavior: 'smooth' }));
    await writeFrame(page, 3);
  }
  await writeFrame(page, 10);

  // ==========================================
  // SCENE 2: Interactive Wallet Connection
  // ==========================================
  console.log('📽️  Scene 2: Interactive Wallet Connection...');
  const connectBtnPos = await getElementCenterByText('Connect Wallet', 'button');
  if (connectBtnPos) {
    console.log(`   Moving to Connect Wallet at (${connectBtnPos.x}, ${connectBtnPos.y})...`);
    await clickAt(connectBtnPos.x, connectBtnPos.y);
    await writeFrame(page, 15); // Show modal opening
  }

  // Modal is now open. Locate and click "1am Wallet"
  const oneAmBtnPos = await getElementCenterByText('1am Wallet', 'button');
  if (oneAmBtnPos) {
    console.log(`   Clicking 1am Wallet in modal at (${oneAmBtnPos.x}, ${oneAmBtnPos.y})...`);
    await clickAt(oneAmBtnPos.x, oneAmBtnPos.y);
    // Write frames while handshake completes and header transforms
    for (let f = 0; f < 25; f++) {
      await writeFrame(page, 1);
    }
  }

  // Hover over the connected address pill to emphasize connected state
  const disconnectBtnPos = await getElementCenterBySelector('button[title="Disconnect wallet"]');
  if (disconnectBtnPos) {
    await moveCursorTo(disconnectBtnPos.x - 60, disconnectBtnPos.y, 8);
    await writeFrame(page, 20); // Pause on connected address
  }

  // ==========================================
  // SCENE 3: Create a Prediction Market Flow
  // ==========================================
  console.log('📽️  Scene 3: Permissionless Market Creation...');
  // Click "+ Create" in navigation bar
  const createNavPos = await getElementCenterByText('+ Create', 'a');
  if (createNavPos) {
    console.log(`   Clicking + Create at (${createNavPos.x}, ${createNavPos.y})...`);
    await clickAt(createNavPos.x, createNavPos.y);
    await writeFrame(page, 15);
  } else {
    await page.goto(`${BASE_URL}/#/create`, { waitUntil: 'networkidle0' });
    await injectCursor();
    await writeFrame(page, 15);
  }

  // Type Market Question
  console.log('   Typing Market Question...');
  await typeSmoothly(
    'input[placeholder*="Will Midnight launch"]',
    'Will Midnight testnet achieve sub-second ZK proof generation in 2026?'
  );

  // Select Category "Crypto/Macro"
  const catPos = await getElementCenterByText('Crypto/Macro', 'button');
  if (catPos) {
    await clickAt(catPos.x, catPos.y);
    await writeFrame(page, 8);
  }

  // Type Resolution Criteria / Description
  console.log('   Typing Description & Rules...');
  await typeSmoothly(
    'textarea[placeholder*="Describe exact conditions"]',
    'Resolves to YES if official Midnight benchmark demonstrates client-side PLONK proving under 1000ms.'
  );

  // Type Resolution Source
  console.log('   Typing Resolution Source...');
  await typeSmoothly(
    'input[placeholder*="Official Midnight Consensus"]',
    'Official Midnight Foundation Consensus & Explorer Telemetry'
  );

  // Scroll down slightly so preview card and submit button are centered
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: 'smooth' }));
  await writeFrame(page, 8);

  // Move cursor to "Deploy Market to Preprod →"
  const deployBtnPos = await getElementCenterByText('Deploy Market to Preprod', 'button');
  if (deployBtnPos) {
    console.log(`   Clicking Deploy Market at (${deployBtnPos.x}, ${deployBtnPos.y})...`);
    await clickAt(deployBtnPos.x, deployBtnPos.y);

    // Record multi-stage ZK deployment progress in the UI
    console.log('   Recording in-flight deployment progress...');
    for (let f = 0; f < 80; f++) {
      await writeFrame(page, 1);
    }
  }

  // Hover over the success modal with Market ID and Tx Hash
  const viewMarketBtnPos = await getElementCenterByText('View Live Market', 'button');
  if (viewMarketBtnPos) {
    await moveCursorTo(viewMarketBtnPos.x, viewMarketBtnPos.y, 8);
    await writeFrame(page, 25); // Pause on success notification
  }

  // ==========================================
  // SCENE 4: Confidential Prediction Placement
  // ==========================================
  console.log('📽️  Scene 4: Confidential Prediction (Shielded Bet)...');
  await page.goto(`${BASE_URL}/#/markets/1`, { waitUntil: 'networkidle0' });
  await injectCursor();
  await writeFrame(page, 15);

  // Hover over market title and sentiment bar
  await moveCursorTo(480, 180, 10);
  await writeFrame(page, 12);

  // Hover over Odds Display chart
  await moveCursorTo(480, 360, 10);
  await writeFrame(page, 15);

  // In Order Slip: Toggle YES / NO to show responsiveness
  const yesBtnPos = await getElementCenterByText('Yes', 'button');
  const noBtnPos = await getElementCenterByText('No', 'button');

  if (yesBtnPos) {
    await clickAt(yesBtnPos.x, yesBtnPos.y);
    await writeFrame(page, 8);
  }
  if (noBtnPos) {
    await clickAt(noBtnPos.x, noBtnPos.y);
    await writeFrame(page, 8);
  }
  if (yesBtnPos) {
    await clickAt(yesBtnPos.x, yesBtnPos.y);
    await writeFrame(page, 8);
  }

  // Set stake amount to "150"
  console.log('   Setting stake amount to 150 tDUST...');
  const amountInputPos = await getElementCenterBySelector('input[type="number"]');
  if (amountInputPos) {
    await clickAt(amountInputPos.x, amountInputPos.y);
    await page.evaluate(() => {
      const inp = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (inp) {
        inp.value = '150';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await writeFrame(page, 15);
  }

  // Click "Place Shielded Bet"
  const placeBetBtnPos = await getElementCenterByText('Place Shielded Bet', 'button');
  if (placeBetBtnPos) {
    console.log(`   Clicking Place Shielded Bet at (${placeBetBtnPos.x}, ${placeBetBtnPos.y})...`);
    await clickAt(placeBetBtnPos.x, placeBetBtnPos.y);

    // Record ZK PLONK proof generation progression & preprod broadcast
    console.log('   Recording ZK proof generation progression...');
    for (let f = 0; f < 80; f++) {
      await writeFrame(page, 1);
    }
  }

  // Hover over the confirmed receipt card (Commitment & Tx Hash)
  const confirmCardPos = await getElementCenterByText('Shielded Position Confirmed', 'div');
  if (confirmCardPos) {
    await moveCursorTo(confirmCardPos.x, confirmCardPos.y + 40, 10);
    await writeFrame(page, 30); // Hold on confirmed ZK position
  }

  // ==========================================
  // SCENE 5: Shielded Portfolio Vault & Outro
  // ==========================================
  console.log('📽️  Scene 5: Shielded Portfolio Vault...');
  const portfolioNavPos = await getElementCenterByText('Portfolio', 'a');
  if (portfolioNavPos) {
    await clickAt(portfolioNavPos.x, portfolioNavPos.y);
    await writeFrame(page, 15);
  } else {
    await page.goto(`${BASE_URL}/#/portfolio`, { waitUntil: 'networkidle0' });
    await injectCursor();
    await writeFrame(page, 15);
  }

  // Hover over portfolio vault metrics
  await moveCursorTo(400, 130, 8);
  await writeFrame(page, 12);
  await moveCursorTo(780, 130, 8);
  await writeFrame(page, 12);

  // Scroll down to display the shielded positions table
  await page.evaluate(() => window.scrollBy({ top: 140, behavior: 'smooth' }));
  await writeFrame(page, 10);

  // Hover over the newly generated shielded position receipt
  await moveCursorTo(960, 420, 10);
  await writeFrame(page, 35); // Hold on private vault view

  // Conclude recording
  console.log('🏁 Concluding recording...');
  await page.close();
  await browser.close();

  ffmpeg.stdin.end();

  await new Promise<void>((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`\n🎉 Demo video generated successfully!`);
        console.log(`Saved to: ${OUTPUT_FILE}`);
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });

  // Copy to Artifact directory
  try {
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }
    fs.copyFileSync(OUTPUT_FILE, ARTIFACT_FILE);
    console.log(`Copied video artifact to: ${ARTIFACT_FILE}`);
  } catch (err) {
    console.warn('Could not copy to artifact directory:', err);
  }
}

recordDemo().catch((err) => {
  console.error('❌ Recording failed:', err);
  process.exit(1);
});
