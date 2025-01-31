import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://angular-ngrx-nx-realworld-example-app-lyart.vercel.app/home');

  // Perform login
  await page.getByPlaceholder('Email').fill('fardinahosan.sqa@gmail.com');
  await page.getByPlaceholder('Password').fill('1q1q1q1q');
  await page.locator('[data-e2e-id="sign-in"]', { hasText: 'Sign in' }).click();

  // Wait for successful login - Ensure it navigates or an element appears
  await page.waitForURL('**/home'); // Adjust based on actual navigation behavior

  // **Mock API AFTER login but BEFORE it's called**
  await page.route('https://real-world-app-39656dff2ddc.herokuapp.com/api/tags', async route => {
    const tags = {
      "tags": ["test", "automations", "playwright"]
    };
    await route.fulfill({
      body: JSON.stringify(tags),
      contentType: 'application/json',
    });
  });

  // **Force the app to re-fetch the API (if needed)**
  await page.reload({ waitUntil: 'networkidle' }); // Ensures fresh requests
});

test('has title', async ({ page }) => {
  const title = await page.locator('.navbar-brand').textContent();
  await expect(title).toBe('conduit');
});
