import {test,expect,request} from '@playwright/test'   
import tags from '../test-data/tags.json';
import dotenv from 'dotenv';
    
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://default-url.com';
const EMAIL = process.env.EMAIL || 'default@example.com';
const PASSWORD = process.env.PASSWORD || 'defaultpassword';

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/home`);

  // await page.route('*/**/api/tags', async route => {
  //   await route.fulfill({
  //     body: JSON.stringify(tags),
  //     contentType: 'application/json',
  //   });
  // });
  // await page.reload({ waitUntil: 'networkidle' }); 
});

test('VerifyPageTitle', async ({ page }) => {
    const title = await page.locator('.navbar-brand').textContent();
    await expect(title).toBe('conduit');
    await page.close();
  });

  test('VerifyApiMockInterception', async ({ page }) => {
    const extractedTags = await page.locator('.tag-list a').allTextContents()
    // //Manual Assertion
    // await expect.soft(extractedTags).toContain(tags.tags[0]);
    // await expect.soft(extractedTags).toContain(tags.tags[1]);
    // await expect.soft(extractedTags).toContain(tags.tags[2]);

    // Loop through each tag in tags.json and assert it is in extractedTags
    for (const tag of tags.tags) {
        await expect.soft(extractedTags).toContain(tag);
    }
  });

  test('verifyThatApiResponseInterception', async ({ page }) => {
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

    await page.waitForTimeout(2000);
    await page.locator('.feed-toggle').getByText('Global Feed').click();
    await expect.soft(await page.locator('[data-e2e-id="article-list"]').nth(0).locator('p')).toHaveText('New Descriptionowpwpwpw');
    await expect.soft(await page.locator('[data-e2e-id="article-list"]').nth(0).locator('h1')).toHaveText('New Title');
  });
  
  test('verifyDeleteArticleUsingUI', async ({ page,request }) => {
    const loginRequest = await request.post('https://real-world-app-39656dff2ddc.herokuapp.com/api/users/login',{
      data:{
        user: {email: "fardinahosan.sqa@gmail.com", password: "1q1q1q1q"}
      }
    })
    const loginResponse = await loginRequest.json();
    //If we need to pass the token in the headers
    //const authToken = loginResponse.user.token;
    console.log(loginResponse);
    expect.soft(loginRequest.status()).toBe(201);

    const publishArticleRequest = await request.post('https://real-world-app-39656dff2ddc.herokuapp.com/api/articles/',{
      data:{
        "article":{"title":"Qwen 2.5 Coder vs OpenAI o1 ","description":"LLM","body":"1. Introduction\nWe introduce our first-generation reasoning models, DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero, a model trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step, demonstrated remarkable performance on reasoning. With RL, DeepSeek-R1-Zero naturally emerged with numerous powerful and interesting reasoning behaviors. However, DeepSeek-R1-Zero encounters challenges such as endless repetition, poor readability, and language mixing. To address these issues and further enhance reasoning performance, we introduce DeepSeek-R1, which incorporates cold-start data before RL. DeepSeek-R1 achieves performance comparable to OpenAI-o1 across math, code, and reasoning tasks. To support the research community, we have open-sourced DeepSeek-R1-Zero, DeepSeek-R1, and six dense models distilled from DeepSeek-R1 based on Llama and Qwen. DeepSeek-R1-Distill-Qwen-32B outperforms OpenAI-o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.","tagList":["LLM"]}
      },
      /* 
      //Only if you need to pass headers and authorization
      //In this case, we are not passing any headers
      headers:{
        Authorization: `Token ${loginResponse.user.token}`
      }
        */
    })
  
    console.log(await publishArticleRequest.json());
    expect.soft(publishArticleRequest.status()).toBe(201);


    await page.getByText('Global Feed').click();
    await page.getByText('Qwen 2.5 Coder vs OpenAI o1').click();
    await page.waitForTimeout(2000);
    const articleTitle=await page.locator('[data-e2e-id="article-title"]').textContent();
    expect.soft(articleTitle).toBe('Qwen 2.5 Coder vs OpenAI o1 ');
    await page.getByText(' Delete Article ').first().click();
    await page.waitForURL('**/home');
    await page.getByText('Global Feed').click();
    await expect.soft(await page.locator('[class="row"]')).not.toHaveText('Qwen 2.5 Coder vs OpenAI o1');
  });

  test('verifyDeleteArticleUsingBackend', async ({ page,request }) => {
    await page.getByText(' New Post ').click();
    await page.getByPlaceholder('Article Title').fill('AKSKSKAK');
    await page.locator('[placeholder="What\'s this article about?"]').fill('Miao Miao');
    await page.locator('[formcontrolname="body"]').fill('010101010000000000001010101');
    await page.locator('[formcontrolname="tagList"]').fill('LLM');
    await page.getByText(' Publish Article ').click();
    const publishArticleRequest =await page.waitForResponse('https://real-world-app-39656dff2ddc.herokuapp.com/api/articles/');
    const pulishArticleResponse =await publishArticleRequest.json();
    const slugID = pulishArticleResponse.article.slug;
    console.log(slugID);

    await page.locator('[class="navbar-brand"]').click(); 
    await page.getByText('Global Feed').click();
    await page.getByText('AKSKSKAK').click();
    await page.waitForTimeout(2000);
    const articleTitle=await page.locator('[data-e2e-id="article-title"]').textContent();
    await expect.soft(articleTitle).toBe('AKSKSKAK');

    const deleteArticleRequest = await request.delete(`https://real-world-app-39656dff2ddc.herokuapp.com/api/articles/${slugID}`)
    await expect.soft(deleteArticleRequest.status()).toBe(200);


    // expect.soft(articleTitle).toBe('Qwen 2.5 Coder vs OpenAI o1 ');
    // await page.getByText(' Delete Article ').first().click();
    // await page.waitForURL('**/home');
    // await page.getByText('Global Feed').click();
    // await expect.soft(await page.locator('[class="row"]')).not.toHaveText('Qwen 2.5 Coder vs OpenAI o1');
  });