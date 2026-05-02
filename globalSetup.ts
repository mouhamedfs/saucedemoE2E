import { chromium, type FullConfig } from '@playwright/test';
import { selectors } from 'playwright';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from './pom/LoginPage';

export default async function globalSetup(config: FullConfig) {
  dotenv.config();

  // Ensure getByTestId() (if used) targets "data-test" everywhere.
  selectors.setTestIdAttribute('data-test');

  const baseURL = config.projects[0]?.use?.baseURL as string | undefined;
  if (!baseURL) throw new Error('baseURL is required in playwright config');

  // Local: use .env via dotenv.config() above. CI has no .env — use env vars or Sauce Demo public demo creds (same as on https://www.saucedemo.com/).
  const username =
    process.env.SAUCE_USERNAME?.trim() ||
    (process.env.CI === 'true' ? 'standard_user' : '');
  const password =
    process.env.SAUCE_PASSWORD?.trim() ||
    (process.env.CI === 'true' ? 'secret_sauce' : '');
  if (!username || !password) {
    throw new Error(
      'Missing SAUCE_USERNAME or SAUCE_PASSWORD. Add them to .env locally, or set repository secrets / workflow env for CI.',
    );
  }

  const authFile = path.resolve(__dirname, 'playwright/.auth/user.json');
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.authenticate(username, password);
  await page.waitForURL('**/inventory.html');

  await context.storageState({ path: authFile });
  await browser.close();
}