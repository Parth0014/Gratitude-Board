import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home has no automated WCAG AA violations on desktop and mobile', async ({
  page,
}, testInfo) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`home-${width}.png`),
      fullPage: true,
    });
  }
});

test('home supports keyboard navigation and the reflection link', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A little space forwhat matters.',
  );
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page
    .getByRole('link', { name: 'Start with a little reflection' })
    .click();
  await expect(page).toHaveURL(/#our-approach$/);
  await expect(
    page.getByRole('heading', { name: 'Your own kind of becoming.' }),
  ).toBeVisible();
});

test('liveness is uncached and security headers are present', async ({
  request,
}) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'web' });
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(response.headers()['x-powered-by']).toBeUndefined();
});

test('unknown routes return a real 404', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Page not found.' }),
  ).toBeVisible();
});

test('board and aspiration meaning survive a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create vision board' }).click();
  await expect(
    page.getByRole('button', { name: /Beginner mode/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Reflector.*direct canvas/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Reflector.*direct canvas/ }).click();
  await expect(
    page.getByRole('heading', { name: 'My vision board' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add aspiration' }).click();
  await page.getByLabel('Aspiration', { exact: true }).fill('A peaceful home');
  await page.getByLabel('Why this matters').fill('More time with family');
  await page.getByRole('button', { name: 'Save meaning' }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: /A peaceful home/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: /A peaceful home/ }).click();
  await expect(page.getByLabel('Why this matters')).toHaveValue(
    'More time with family',
  );
});

test('guided mode builds an idea and can switch to the canvas', async ({
  page,
}) => {
  await page.goto('/boards/new');
  await page.getByRole('button', { name: /Beginner mode/ }).click();
  await expect(
    page.getByRole('heading', { name: 'What do you want more of?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Calm/ }).click();
  await page.getByRole('button', { name: 'Continue with Calm' }).click();
  await page.getByRole('button', { name: /A moment outdoors/ }).click();
  await page.getByRole('button', { name: 'Use this moment' }).click();
  await page.getByLabel('Name this piece').fill('More time outdoors');
  await page.getByLabel('What does it mean to you?').fill('Space to breathe');
  await page.getByRole('button', { name: 'Place on my board' }).click();
  await expect(
    page.getByRole('heading', { name: 'Here is what you have started.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'More time outdoors' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Here is what you have started.' }),
  ).toBeVisible();
  await expect(page.getByText('Space to breathe')).toBeVisible();
  await page.getByRole('button', { name: 'Edit this piece' }).click();
  await page.getByLabel('Name this piece').fill('More walks outdoors');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('heading', { name: 'More walks outdoors' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Open my canvas' }).click();
  await expect(
    page.getByRole('button', { name: /More walks outdoors/ }),
  ).toBeVisible();
});
