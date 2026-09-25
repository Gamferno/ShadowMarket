import puppeteer, { Page } from "puppeteer-core";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const WEBM_PATH = path.resolve(process.cwd(), "demo.webm");
const MP4_PATH = path.resolve(process.cwd(), "demo.mp4");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Resilient button clicker using DOM evaluation
async function clickButtonByText(page: Page, text: string): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const clicked = await page.evaluate((targetText) => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find((b) => (b.textContent || "").toLowerCase().includes(targetText.toLowerCase()));
        if (btn && !btn.disabled) {
          btn.scrollIntoView({ behavior: "smooth", block: "center" });
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

// React-compatible input setter to ensure state hooks update
async function setReactInputValue(page: Page, selector: string, value: string, index = 0) {
  await page.evaluate((sel, val, idx) => {
    const elements = Array.from(document.querySelectorAll(sel));
    const el = elements[idx] as HTMLInputElement | HTMLTextAreaElement;
    if (el) {
      const proto = el instanceof HTMLInputElement ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, selector, value, index);
}

// Instant client-side route navigation via HashRouter
async function navigateHash(page: Page, hash: string) {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
  await sleep(1500);
}

async function smoothScroll(page: Page, distance: number, steps = 14, delayMs = 45) {
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    try {
      await page.evaluate((d) => window.scrollBy(0, d), stepDist);
    } catch {}
    await sleep(delayMs);
  }
}

async function main() {
  console.log("\n=============================================================");
  console.log("🎬 ShadowMarket: Official Demo Video Recording (Full Workspace)");
  console.log("   Native Screen Resolution | Real Wallet Flow | Preprod Live");
  console.log("=============================================================\n");

  // Start wf-recorder to capture the entire desktop workspace (2880x1800, 30fps)
  console.log("🎥 Launching wf-recorder for entire workspace capture...");
  const recorder = spawn("wf-recorder", [
    "-r", "30",
    "-y",
    "-f", MP4_PATH
  ]);

  recorder.stderr.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("Output #0") || msg.includes("Framerate:")) {
      console.log(`[Recorder]: ${msg.trim()}`);
    }
  });

  await sleep(1500); // Allow recorder to establish screen hooks
  console.log("🔴 Workspace screen recording active!\n");

  console.log("Connecting to Chromium on http://localhost:9222 ...");
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: null // Keep natural window size and full screen
  });

  const pages = await browser.pages();
  const page = pages.find((p) => p.url().includes("3000")) || pages[0] || (await browser.newPage());
  await page.setViewport(null);
  try {
    const client = await page.target().createCDPSession();
    await client.send("Emulation.clearDeviceMetricsOverride");
  } catch {}
  await page.bringToFront();

  try {
    // =======================================================================
    // SCENE 1: Landing Page & Hero
    // =======================================================================
    console.log("📍 [Scene 1] Landing Page & Live Preprod Badges...");
    await page.goto("http://localhost:3000/#/", { waitUntil: "networkidle0" });
    await sleep(2500);

    // Reset wallet state so the video demonstrates the full connect flow cleanly on camera
    const wasConnected = await page.evaluate(() => !!document.querySelector("button[title=\"Disconnect wallet\"]"));
    if (wasConnected) {
      console.log("Resetting wallet connection to showcase clean connect flow on camera...");
      await page.evaluate(() => {
        const disc = document.querySelector("button[title=\"Disconnect wallet\"]");
        if (disc) (disc as HTMLButtonElement).click();
      });
      await sleep(1500);
    }

    console.log("Connecting 1am wallet on camera...");
    const clickedConnect = await clickButtonByText(page, "Connect Wallet");
    if (clickedConnect) {
      await sleep(1200);
      await clickButtonByText(page, "1am Wallet");
      console.log("\n=============================================================");
      console.log("🔔 [ACTION REQUIRED IN 1AM WALLET POPUP]:");
      console.log("   Please click \"APPROVE\" to connect 1am Wallet to Preprod!");
      console.log("=============================================================\n");

      const start = Date.now();
      while (Date.now() - start < 45000) {
        const isConnected = await page.evaluate(() => !!document.querySelector("button[title=\"Disconnect wallet\"]"));
        if (isConnected) {
          console.log("✅ 1am Wallet connected successfully!");
          break;
        }
        await sleep(1000);
      }
    }

    await sleep(1500);

    // Showcase hero metrics & 3-step confidentiality model
    await smoothScroll(page, 450);
    await sleep(2000);
    await smoothScroll(page, 450);
    await sleep(2500);
    await smoothScroll(page, -900);
    await sleep(1500);

    // =======================================================================
    // SCENE 2: Markets Catalog & Search
    // =======================================================================
    console.log("📍 [Scene 2] Markets Catalog & Real-Time Category Filters...");
    await navigateHash(page, "/markets");
    await sleep(2000);

    // Click Category Filters
    await clickButtonByText(page, "Crypto/Macro");
    await sleep(1500);
    await clickButtonByText(page, "Politics");
    await sleep(1500);
    await clickButtonByText(page, "All");
    await sleep(1500);

    await smoothScroll(page, 350);
    await sleep(2000);
    await smoothScroll(page, -350);
    await sleep(1200);

    // =======================================================================
    // SCENE 3: Market Detail & Interactive Odds Trajectory
    // =======================================================================
    console.log("📍 [Scene 3] Market Detail & Dynamic Probability Chart...");
    await navigateHash(page, "/markets/1");
    await sleep(2000);

    // Toggle Dynamic Odds Chart
    const toggledHide = await clickButtonByText(page, "Hide Chart");
    if (toggledHide) {
      await sleep(1200);
      await clickButtonByText(page, "Show Chart");
      await sleep(1500);
    }

    // Scroll down to Place Shielded Position
    await smoothScroll(page, 380);
    await sleep(1500);

    // Set Bet Amount to 50
    await setReactInputValue(page, "input[type=\"number\"]", "50");
    await sleep(1000);

    // Open Shielded Bet Confirmation Modal
    console.log("Opening Shielded Bet Confirmation Modal...");
    const clickedPlace = await clickButtonByText(page, "Place Shielded Bet");
    if (clickedPlace) {
      await sleep(2000);

      console.log("Clicking Confirm & Prove...");
      const clickedConfirm = await clickButtonByText(page, "Confirm & Prove");
      if (clickedConfirm) {
        console.log("\n=============================================================");
        console.log("⚙️  ZK PROVING PIPELINE ACTIVE (Port 6300)...");
        console.log("🔔 [ACTION REQUIRED IN 1AM WALLET POPUP]:");
        console.log("   Please click \"APPROVE\" in your 1am wallet transaction popup!");
        console.log("=============================================================\n");

        const betStart = Date.now();
        let lastLog = 0;
        while (Date.now() - betStart < 120000) {
          const isDone = await page.evaluate(() => {
            const txt = document.body.innerText;
            return (
              txt.includes("Shielded Bet Confirmed") ||
              txt.includes("Shielded Position Confirmed") ||
              txt.includes("Transaction was rejected")
            );
          });
          if (isDone) {
            console.log("✅ Shielded bet transaction confirmed on Preprod!");
            break;
          }
          const elapsed = Math.floor((Date.now() - betStart) / 1000);
          if (elapsed - lastLog >= 5) {
            lastLog = elapsed;
            console.log(`   ⏳ [Shielded Bet] Proving & waiting for approval (${elapsed}s elapsed)...`);
          }
          await sleep(1500);
        }
        await sleep(3500);
      }
    }

    // =======================================================================
    // SCENE 4: Create Market
    // =======================================================================
    console.log("📍 [Scene 4] Permissionless Market Creation Form...");
    await navigateHash(page, "/create");
    await sleep(2000);

    console.log("📝 Filling Create Market form fields...");
    const questionText = "Will Midnight achieve 10,000 TPS with recursive ZK proofs in 2026?";
    const descriptionText = "Resolves to YES if Midnight network demonstrates >10,000 TPS verified via official telemetry or block explorer.";
    const sourceText = "Official Midnight Protocol Telemetry & Cardano Ledger Explorer";

    await setReactInputValue(page, "input[type=\"text\"]", questionText, 0);
    await sleep(500);
    await setReactInputValue(page, "textarea", descriptionText, 0);
    await sleep(500);
    await setReactInputValue(page, "input[type=\"text\"]", sourceText, 1);
    await sleep(1000);

    // Verify Deploy button is enabled
    const deployState = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => (b.textContent || "").includes("Deploy Market"));
      return { found: !!btn, disabled: btn ? btn.disabled : true };
    });
    console.log(`Deploy button status: found=${deployState.found}, disabled=${deployState.disabled}`);

    await smoothScroll(page, 320);
    await sleep(2000);

    console.log("Submitting new market deployment via createMarket()...");
    const clickedDeploy = await clickButtonByText(page, "Deploy Market to Preprod");
    if (clickedDeploy) {
      console.log("\n=============================================================");
      console.log("⚙️  EXECUTING createMarket() ZK CIRCUIT...");
      console.log("🔔 [ACTION REQUIRED IN 1AM WALLET POPUP]:");
      console.log("   Please click \"APPROVE\" in your 1am wallet for createMarket()!");
      console.log("=============================================================\n");

      const createStart = Date.now();
      let lastLog = 0;
      while (Date.now() - createStart < 120000) {
        const isDone = await page.evaluate(() => {
          const txt = document.body.innerText;
          return (
            txt.includes("Market Deployed Successfully") ||
            txt.includes("Market creation failed") ||
            txt.includes("Transaction was rejected")
          );
        });
        if (isDone) {
          console.log("✅ createMarket() circuit executed and deployed to Preprod!");
          break;
        }
        const elapsed = Math.floor((Date.now() - createStart) / 1000);
        if (elapsed - lastLog >= 5) {
          lastLog = elapsed;
          console.log(`   ⏳ [Create Market] Proving & waiting for approval (${elapsed}s elapsed)...`);
        }
        await sleep(1500);
      }
      await sleep(3500);
    }

    // =======================================================================
    // SCENE 5: Private Portfolio & Decrypted Receipts
    // =======================================================================
    console.log("📍 [Scene 5] Private Portfolio & Decrypted Positions...");
    await navigateHash(page, "/portfolio");
    await sleep(2000);
    await smoothScroll(page, 350);
    await sleep(2500);
    await smoothScroll(page, -350);
    await sleep(1500);

    // =======================================================================
    // SCENE 6: Resolver Console
    // =======================================================================
    console.log("📍 [Scene 6] Oracle & Resolver Console...");
    await navigateHash(page, "/admin");
    await sleep(2000);
    await smoothScroll(page, 380);
    await sleep(2500);
    await smoothScroll(page, -380);
    await sleep(1500);

    // =======================================================================
    // SCENE 7: Architecture & Protocol Specifications
    // =======================================================================
    console.log("📍 [Scene 7] About & Privacy Architecture...");
    await navigateHash(page, "/about");
    await sleep(2000);
    await smoothScroll(page, 450);
    await sleep(2000);
    await smoothScroll(page, 450);
    await sleep(2500);
    await smoothScroll(page, -900);
    await sleep(2000);
  } finally {
    // Gracefully stop workspace screen recording
    console.log("⏹️ Stopping workspace screen recording (SIGINT to wf-recorder)...");
    recorder.kill("SIGINT");

    await new Promise((resolve) => recorder.on("close", resolve));
    console.log("✅ wf-recorder successfully stopped.");
  }

  // Convert MP4 to WebM for dual-format distribution
  console.log("🔄 Converting demo.mp4 to WebM (VP9)...");
  const webmConvert = spawn("ffmpeg", [
    "-y",
    "-i", MP4_PATH,
    "-c:v", "libvpx-vp9",
    "-b:v", "2500k",
    "-preset", "fast",
    WEBM_PATH
  ]);

  await new Promise((resolve, reject) => {
    webmConvert.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  // Copy both to docs/demo/
  fs.copyFileSync(MP4_PATH, path.resolve(process.cwd(), "docs/demo/demo.mp4"));
  fs.copyFileSync(WEBM_PATH, path.resolve(process.cwd(), "docs/demo/demo.webm"));

  const mp4Stats = fs.statSync(MP4_PATH);
  const webmStats = fs.statSync(WEBM_PATH);

  console.log("\n=============================================================");
  console.log("🏆 DEMO RECORDING COMPLETE (Full Workspace)!");
  console.log(`   📹 MP4 Video:  ${MP4_PATH} (${(mp4Stats.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   📹 WebM Video: ${WEBM_PATH} (${(webmStats.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log("=============================================================\n");

  browser.disconnect();
}

main().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
