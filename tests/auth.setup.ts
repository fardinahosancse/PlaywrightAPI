import {test as setup} from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();
const authFile = './auth/user.json';
const BASE_URL = process.env.BASE_URL || 'https://default-url.com';
const EMAIL = process.env.EMAIL || 'default@example.com';
const PASSWORD = process.env.PASSWORD || 'defaultpassword';

setup('Authentication', async ({page}) => {
    await page.goto(`${BASE_URL}/home`);
    await page.getByPlaceholder('Email').fill(EMAIL);
    await page.getByPlaceholder('Password').fill(PASSWORD);
    await page.locator('[data-e2e-id="sign-in"]', { hasText: 'Sign in' }).click();
    await page.waitForResponse('https://real-world-app-39656dff2ddc.herokuapp.com/api/tags')
    await page.context().storageState({path:authFile})
});