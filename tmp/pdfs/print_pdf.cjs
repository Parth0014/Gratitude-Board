const puppeteer = require('../../node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.goto('file:///C:/Users/jaypa/Videos/gratitudeBoard/tmp/pdfs/excalidraw_editing_tools_inventory.html', {waitUntil: 'networkidle0'});
  await page.pdf({path: 'output/pdf/excalidraw_editing_tools_inventory.pdf', format: 'A4', printBackground: true, displayHeaderFooter: false});
  await browser.close();
})();
