import puppeteer from 'puppeteer-core';

async function verifyNewMarket() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: { width: 1280, height: 900 }
  });
  const page = (await browser.pages())[0];
  await page.goto('http://localhost:3000/#/markets', { waitUntil: 'networkidle0' });

  // Find card with text 'private cross-chain swaps'
  const links = await page.$$('a[href*="/markets/"]');
  for (const l of links) {
    const text = await page.evaluate((el) => el.textContent || '', l);
    if (text.includes('private cross-chain swaps')) {
      const href = await page.evaluate((el) => el.getAttribute('href'), l);
      console.log('Found new market link:', href);
      await l.click();
      await new Promise((r) => setTimeout(r, 2000));
      await page.screenshot({ path: 'test-screenshots/create-market-05-new-market-detail.png' });
      console.log('📸 Saved create-market-05-new-market-detail.png');
      break;
    }
  }
  browser.disconnect();
}

verifyNewMarket().catch(console.error);
