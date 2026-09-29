const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: process.env.HEADLESS !== 'false', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto('https://www.canva.com/design/DAHWR7il1GA/QcqQ_5xYFKMdVjWpxtyqzA/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (process.env.WAIT_FOR_LOGIN === 'true' && page.url().includes('/login/')) {
      console.log('Canva sign-in is open in Edge. Waiting for the design editor...');
      await page.waitForURL((url) => url.pathname.includes('/design/') && url.pathname.endsWith('/edit'), { timeout: 300000 });
    }
    await page.waitForTimeout(7000);
    console.log(JSON.stringify({ status: response?.status(), url: page.url(), title: await page.title(), text: (await page.locator('body').innerText()).slice(0, 1500), errors: errors.slice(0, 4) }, null, 2));
    await page.screenshot({ path: 'tmp/canva-playwright.png', fullPage: false });
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
