import fs from 'fs';
import { chromium } from 'playwright';

export async function loginToDisney() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://disneyworld.disney.go.com/login/');
  await page.fill('#username', process.env.DISNEY_EMAIL);
  await page.fill('#password', process.env.DISNEY_PASSWORD);
  await page.click('[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  const cookies = await page.context().cookies();
  fs.writeFileSync('./session/cookies.json', JSON.stringify(cookies));
  await browser.close();
}