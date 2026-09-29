import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("http://127.0.0.1:4173", {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: "Gratitude Studio" }).waitFor();
  await page.getByRole("button", { name: /photos/i }).first().waitFor();

  console.log(
    JSON.stringify({
      viewport: viewport.name,
      title: await page.title(),
      bodyWidth: await page.locator("body").evaluate((node) => node.scrollWidth),
      viewportWidth: viewport.width,
      consoleErrors: errors,
    }),
  );
  await page.close();
}

await browser.close();
