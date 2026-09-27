import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home and creation route are keyboard accessible', async ({ page }) => {
  await page.goto('/');
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.getByRole('link', { name: 'Create vision board' }).click();
  await expect(
    page.getByRole('heading', { name: 'Make a board that feels like yours.' }),
  ).toBeVisible();
});

test('liveness keeps security headers', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'web' });
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
});

test('unknown routes return 404', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
});

test('starter collage opens from local tldraw source and survives reload', async ({
  page,
}) => {
  await page.goto('/boards/new');
  await page.getByRole('button', { name: /Career & purpose/ }).click();
  await expect(page.locator('.tl-shape')).toHaveCount(4);
  await expect(
    page.getByRole('navigation', { name: 'Add to board' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('.tl-shape')).toHaveCount(4);
});

test('photo shelf adds an image and the board exports a PNG', async ({
  page,
}) => {
  await page.goto('/boards/new');
  await page.getByRole('button', { name: /Career & purpose/ }).click();
  await expect(page.locator('.tl-shape')).toHaveCount(4);
  await page.getByRole('button', { name: 'Photos', exact: true }).click();
  await page.getByRole('button', { name: 'Somewhere new' }).click();
  await expect(page.locator('.tl-shape')).toHaveCount(5);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  await page.reload();
  await expect(page.locator('.tl-shape')).toHaveCount(5);
});

test('board can return to guided view', async ({ page }) => {
  await page.goto('/boards/new');
  await page.getByRole('button', { name: /Career & purpose/ }).click();
  await expect(page.locator('.tl-shape')).toHaveCount(4);
  await page.getByRole('button', { name: 'Guided view' }).click();
  await expect(
    page.getByRole('heading', { name: 'Career & purpose' }),
  ).toBeVisible();
  await expect(page.locator('.tl-shape')).toHaveCount(0);
});
