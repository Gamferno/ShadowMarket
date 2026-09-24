import puppeteer, { Page } from 'puppeteer-core';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const WEBM_PATH = path.resolve(process.cwd(), 'demo.webm');
const MP4_PATH = path.resolve(process.cwd(), 'demo.mp4');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Resilient button clicker using DOM evaluation (immune to detached frame errors)
async function clickButtonByText(page: Page, text: string): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const clicked = await page.evaluate((targetText) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find((b) => (b.textContent || '').toLowerCase().includes(targetText.toLowerCase()));
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          btn.click();
          return true;
        }
        return false;
      }, text);
      if (clicked) return true;
    } catch {
      await sleep(300);
    }
  }
  return false;
}

// Instant client-side route navigation via HashRouter (no full-page frame reload)
async function navigateHash(page: Page, hash: string) {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
  await sleep(1500);
}

async function smoothScroll(page: Page, distance: number, steps = 12, delayMs = 45) {
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    try {
      await page.evaluate((d) => window.scrollBy(0, d), stepDist);
    } catch {}
    await sleep(delayMs);
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log('🎬 ShadowMarket: Official Demo Video Recording (WebM + MP4)');
  console.log('=============================================================\n');

  console.log('Connecting to Chromium on http://localhost:9222 ...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: null // Keep natural window size, zero resizing or flickering
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());

  // Start FFmpeg subprocess for WebM encoding (VP9, 10 fps, high quality)
  console.log('🎥 Initializing FFmpeg recorder...');
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '10',
    '-i', '-',
    '-c:v', 'libvpx-vp9',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
    '-b:v', '2500k',
    WEBM_PATH
  ]);

  let isRecording = true;
  let frameCount = 0;

  const captureLoop = async () => {
    while (isRecording) {
      try {
        const frame = await page.screenshot({ type: 'jpeg', quality: 85 });
        if (isRecording && frame) {
          ffmpeg.stdin.write(frame);
          frameCount++;
        }
      } catch {
        // Harmless: skip frame during transient DOM updates
      }
      await sleep(100); // 10 fps
    }
  };

  const recordingPromise = captureLoop();
  console.log('🔴 Recording started!\n');

  try {
    // =======================================================================
    // SCENE 1: Landing Page & Hero
    // =======================================================================
    console.log('📍 [Scene 1] Landing Page & Live Preprod Badges...');
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle0' });
    await sleep(2500);

    // Check if wallet is connected; if not, demonstrate connecting 1am wallet
    const isConnected = await page.evaluate(() => {
      return !!document.querySelector('button[title="Disconnect wallet"]');
    });

    if (!isConnected) {
      console.log('Connecting 1am wallet on camera...');
      const clickedConnect = await clickButtonByText(page, 'Connect Wallet');
      if (clickedConnect) {
        await sleep(1000);
        await clickButtonByText(page, '1am Wallet');
        console.log('\n🔔 [ACTION IN CHROMIUM]: Please click "APPROVE" to connect 1am!\n');
        const start = Date.now();
        while (Date.now() - start < 30000) {
          const connectedNow = await page.evaluate(() => !!document.querySelector('button[title="Disconnect wallet"]'));
          if (connectedNow) break;
          await sleep(1500);
        }
      }
    }

    // Showcase hero metrics & 3-step confidentiality model
    await smoothScroll(page, 450);
    await sleep(2000);
    await smoothScroll(page, 450);
    await sleep(2000);
    await smoothScroll(page, -900);
    await sleep(1500);

    // =======================================================================
    // SCENE 2: Markets Catalog & Search
    // =======================================================================
    console.log('📍 [Scene 2] Markets Catalog & Real-Time Filters...');
    await navigateHash(page, '/markets');
    await sleep(2000);

    // Click Category Filters
    await clickButtonByText(page, 'Crypto/Macro');
    await sleep(1500);
    await clickButtonByText(page, 'Politics');
    await sleep(1500);
    await clickButtonByText(page, 'All');
    await sleep(1500);

    await smoothScroll(page, 350);
    await sleep(1800);
    await smoothScroll(page, -350);
    await sleep(1200);

    // =======================================================================
    // SCENE 3: Market Detail & Interactive Odds Trajectory
    // =======================================================================
    console.log('📍 [Scene 3] Market Detail & Dynamic Probability Chart...');
    await navigateHash(page, '/markets/1');
    await sleep(2000);

    // Toggle Dynamic Odds Chart
    const toggledHide = await clickButtonByText(page, 'Hide Chart');
    if (toggledHide) {
      await sleep(1200);
      await clickButtonByText(page, 'Show Chart');
      await sleep(1500);
    }

    // Scroll down to Place Shielded Position
    await smoothScroll(page, 380);
    await sleep(1500);

    // Select YES and amount
    const amountInput = await page.$('input[type="number"]');
    if (amountInput) {
      await page.evaluate((el) => {
        (el as HTMLInputElement).value = '50';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, amountInput);
      await sleep(1000);
    }

    // Open Shielded Bet Confirmation Modal
    console.log('Opening Shielded Bet Confirmation Modal...');
    const clickedPlace = await clickButtonByText(page, 'Place Shielded Bet');
    if (clickedPlace) {
      await sleep(2000);

      console.log('Clicking Confirm & Prove...');
      const clickedConfirm = await clickButtonByText(page, 'Confirm & Prove');
      if (clickedConfirm) {
        console.log('\n=============================================================');
        console.log('⚙️  ZK PROVING PIPELINE ACTIVE (Port 6300)...');
        console.log('🔔 [ACTION REQUIRED IN CHROMIUM]:');
        console.log('   Please click "APPROVE" in your 1am wallet transaction popup!');
        console.log('=============================================================\n');

        // Allow up to 90 seconds for ZK proof + 1am signing + on-chain confirmation
        const betStart = Date.now();
        while (Date.now() - betStart < 90000) {
          const isDone = await page.evaluate(() => {
            const txt = document.body.innerText;
            return (
              txt.includes('Shielded Bet Confirmed') ||
              txt.includes('Shielded Position Confirmed') ||
              txt.includes('Transaction was rejected')
            );
          });
          if (isDone) break;
          await sleep(2000);
        }
        await sleep(3500);
      }
    }

    // =======================================================================
    // SCENE 4: Create Market
    // =======================================================================
    console.log('📍 [Scene 4] Permissionless Market Creation Form...');
    await navigateHash(page, '/create');
    await sleep(2000);

    // Fill form safely
    await page.evaluate(() => {
      const textInputs = Array.from(document.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

      if (textInputs[0]) {
        textInputs[0].value = 'Will Midnight achieve 10,000 TPS with recursive ZK proofs in 2026?';
        textInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (textarea) {
        textarea.value = 'Resolves to YES if Midnight testnet or mainnet validates 10k TPS via official metrics.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (textInputs[1]) {
        textInputs[1].value = 'Official Midnight Protocol Consensus Telemetry';
        textInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(1500);

    await smoothScroll(page, 280);
    await sleep(2000);

    // Click Deploy Market to Preprod
    console.log('Submitting new market deployment...');
    const clickedDeploy = await clickButtonByText(page, 'Deploy Market to Preprod');
    if (clickedDeploy) {
      console.log('\n=============================================================');
      console.log('⚙️  EXECUTING createMarket() ZK CIRCUIT...');
      console.log('🔔 [ACTION REQUIRED IN CHROMIUM]:');
      console.log('   Please click "APPROVE" in your 1am wallet for createMarket()!');
      console.log('=============================================================\n');

      const createStart = Date.now();
      while (Date.now() - createStart < 90000) {
        const isDone = await page.evaluate(() => {
          const txt = document.body.innerText;
          return (
            txt.includes('Market Deployed Successfully') ||
            txt.includes('Market creation failed')
          );
        });
        if (isDone) break;
        await sleep(2000);
      }
      await sleep(3000);
    }

    // =======================================================================
    // SCENE 5: Private Portfolio & Decrypted Receipts
    // =======================================================================
    console.log('📍 [Scene 5] Private Portfolio & Decrypted Positions...');
    await navigateHash(page, '/portfolio');
    await sleep(2000);
    await smoothScroll(page, 320);
    await sleep(2500);
    await smoothScroll(page, -320);
    await sleep(1500);

    // =======================================================================
    // SCENE 6: Resolver Console
    // =======================================================================
    console.log('📍 [Scene 6] Oracle & Resolver Console...');
    await navigateHash(page, '/admin');
    await sleep(2000);
    await smoothScroll(page, 380);
    await sleep(2500);
    await smoothScroll(page, -380);
    await sleep(1500);

    // =======================================================================
    // SCENE 7: Architecture & Protocol Specifications
    // =======================================================================
    console.log('📍 [Scene 7] About & Privacy Architecture...');
    await navigateHash(page, '/about');
    await sleep(2000);
    await smoothScroll(page, 420);
    await sleep(2000);
    await smoothScroll(page, 420);
    await sleep(2500);
    await smoothScroll(page, -840);
    await sleep(2000);
  } finally {
    // Stop recording
    console.log('⏹️ Stopping video capture...');
    isRecording = false;
    await recordingPromise;
    ffmpeg.stdin.end();

    await new Promise((resolve) => ffmpeg.on('close', resolve));
    console.log(`\n🎉 Recorded ${frameCount} frames into ${WEBM_PATH}`);
  }

  // Convert WebM to MP4 with universal H.264 profile
  console.log('🔄 Converting demo.webm to universal demo.mp4 (H.264 / AAC / yuv420p)...');
  const mp4Convert = spawn('ffmpeg', [
    '-y',
    '-i', WEBM_PATH,
    '-c:v', 'libx264',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    MP4_PATH
  ]);

  await new Promise((resolve, reject) => {
    mp4Convert.on('close', (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  const webmStats = fs.statSync(WEBM_PATH);
  const mp4Stats = fs.statSync(MP4_PATH);

  console.log('\n=============================================================');
  console.log('🏆 DEMO RECORDING COMPLETE!');
  console.log(`   📹 WebM Video: ${WEBM_PATH} (${(webmStats.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   📹 MP4 Video:  ${MP4_PATH} (${(mp4Stats.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log('=============================================================\n');

  browser.disconnect();
}

main().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
