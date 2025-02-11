import {test as setup,} from '@playwright/test';
import user from '../auth/user.json';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const authFile = './auth/user.json';
const BASE_URL = process.env.BASE_URL || 'https://default-url.com';
const EMAIL = process.env.EMAIL || 'default@example.com';
const PASSWORD = process.env.PASSWORD || 'defaultpassword';

setup('Authentication', async ({page,request}) => {
    // await page.goto(`${BASE_URL}/home`);
    // await page.getByPlaceholder('Email').fill(EMAIL);
    // await page.getByPlaceholder('Password').fill(PASSWORD);
    // await page.locator('[data-e2e-id="sign-in"]', { hasText: 'Sign in' }).click();
    // await page.waitForResponse('https://real-world-app-39656dff2ddc.herokuapp.com/api/tags')
    const loginRequest = await request.post('https://real-world-app-39656dff2ddc.herokuapp.com/api/users/login',{
        data:{
          user: {email: "fardinahosan.sqa@gmail.com", password: "1q1q1q1q"}
        }
      })
    const loginResponse = await loginRequest.json();
    const authToken = loginResponse.user.token;
    user.cookies[0].value=authToken;
    fs.writeFileSync(authFile, JSON.stringify(user));
});