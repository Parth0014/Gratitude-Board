import { chromium } from "playwright";

/* eslint-disable no-console */

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
  await page
    .getByRole("button", { name: /photos/i })
    .first()
    .waitFor();

  const bodyWidth = await page.locator("body").evaluate((node) => node.scrollWidth);
  const starterVisible = await page
    .getByRole("region", { name: "Start your board" })
    .isVisible();
  const assetPanelHeight = await page
    .locator(".gratitude-assets")
    .evaluate((node) => node.getBoundingClientRect().height);

  if (bodyWidth > viewport.width) {
    throw new Error(
      `${viewport.name} page overflows by ${bodyWidth - viewport.width}px`,
    );
  }
  if (errors.length) {
    throw new Error(`${viewport.name} console errors: ${errors.join(" | ")}`);
  }
  if (!starterVisible) {
    throw new Error(`${viewport.name} empty-board starter is not visible`);
  }
  if (viewport.name === "mobile" && assetPanelHeight > 100) {
    throw new Error(
      `mobile asset dock should start collapsed; height was ${assetPanelHeight}px`,
    );
  }

  console.log(
    JSON.stringify({
      viewport: viewport.name,
      title: await page.title(),
      bodyWidth,
      viewportWidth: viewport.width,
      starterVisible,
      assetPanelHeight,
      consoleErrors: errors,
    }),
  );
  await page.close();
}

await browser.close();
