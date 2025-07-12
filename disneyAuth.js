import { chromium } from 'playwright';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export async function loginToDisney() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://disneyworld.disney.go.com/login/');
  await page.fill('#loginPageUsername', process.env.DISNEY_EMAIL);
  await page.fill('#loginPagePassword', process.env.DISNEY_PASSWORD);
  await page.click('#loginPageSubmitButton');

  await page.waitForTimeout(5000);
  const cookies = await context.cookies();
  fs.writeFileSync('./session/cookies.json', JSON.stringify(cookies, null, 2));

  await browser.close();
  console.log('✅ Disney session cookies refreshed.');
}
