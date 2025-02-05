import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page }) => {
  await page.goto('https://angular-ngrx-nx-realworld-example-app-lyart.vercel.app/home');

  // Perform login
  await page.getByPlaceholder('Email').fill('fardinahosan.sqa@gmail.com');
  await page.getByPlaceholder('Password').fill('1q1q1q1q');
  await page.locator('[data-e2e-id="sign-in"]', { hasText: 'Sign in' }).click();

  // Wait for successful login
  await page.waitForURL('**/home');
  //Lecture 3 : Answers////////////////////////////////////////
  // **Mock API AFTER login but BEFORE it's called**
  // await page.route('*/**/api/tags', async route => {
  //   await route.fulfill({
  //     body: JSON.stringify(tags),
  //     contentType: 'application/json',
  //   });
  // });

  // // **Force the app to re-fetch the API (if needed)**
  await page.reload({ waitUntil: 'networkidle' }); 
  // // Ensures fresh requests

  //////////////////////////////////////////////////////////////
  //Lecture 4 : Answers////////////////////////////////////////
  // Mock API response
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = 'New Title';
    responseBody.articles[0].description = 'New Descriptionowpwpwpw';
    responseBody.articles[0].body = 'New Body';

    await route.fulfill({
      body: JSON.stringify(responseBody),
      contentType: 'application/json'
    });
  });
  //////////////////////////////////////////////////////////////
});

test('has title', async ({ page }) => {
  const title = await page.locator('.navbar-brand').textContent();
  await expect(title).toBe('conduit');
  await page.close();
});

test('apiResponseCheck', async ({ page }) => {
  await page.locator('.feed-toggle').getByText('Global Feed').click();
  await expect.soft(await page.locator('[data-e2e-id="article-list"]').nth(0).locator('p')).toHaveText('New Descriptionowpwpwpw');
  await expect.soft(await page.locator('[data-e2e-id="article-list"]').nth(0).locator('h1')).toHaveText('New Title');
});
