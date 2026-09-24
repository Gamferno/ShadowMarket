import puppeteer from 'puppeteer-core';

async function testConnection() {
  console.log('Connecting to Chromium on http://localhost:9222...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: null
  });

  console.log('Connected! Browser version:', await browser.version());
  const pages = await browser.pages();
  console.log(`Found ${pages.length} open page(s).`);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Page ${i}: ${await pages[i].title()} (${pages[i].url()})`);
  }

  const targets = browser.targets();
  console.log(`Total targets: ${targets.length}`);
  targets.forEach((t) => {
    console.log(`- Target: type=${t.type()}, url=${t.url()}`);
  });

  browser.disconnect();
}

testConnection().catch((err) => {
  console.error('Connection probe failed:', err);
  process.exit(1);
});
