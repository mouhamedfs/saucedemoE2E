import type { Locator } from '@playwright/test';
import { test, expect } from '../fixtures';

/** Login specs must start without the shared auth file from globalSetup. */
test.use({ storageState: { cookies: [], origins: [] } });

const username = process.env.SAUCE_USERNAME;
const password = process.env.SAUCE_PASSWORD;
const fakeUsername = process.env.FAKE_USERNAME;
const fakePassword = process.env.FAKE_PASSWORD;
const lockedOutUser = process.env.LOCKED_OUT_USER;
const problemUser = process.env.PROBLEM_USER;
const performanceGlitchUser = process.env.PERFORMANCE_GLITCH_USER;
const errorUser = process.env.ERROR_USER;
const visualUser = process.env.VISUAL_USER;


function requireEnv(value: string | undefined, name: string): string {
    if (!value) throw new Error(`Set ${name} in .env`);
    return value;
}

async function resolvedImageUrl(locator: Locator): Promise<string> {
    return locator.evaluate((img: HTMLImageElement) => img.currentSrc || img.getAttribute('src') || '');
}

test('Login with valid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(username, 'SAUCE_USERNAME'), requireEnv(password, 'SAUCE_PASSWORD'));
    await expect(page).toHaveURL('/inventory.html');
});

test('Login with invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(fakeUsername, 'FAKE_USERNAME'), requireEnv(fakePassword, 'FAKE_PASSWORD'));
    await loginPage.verifyError('Epic sadface: Username and password do not match any user in this service');
});

test('Login with locked out user', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(lockedOutUser, 'LOCKED_OUT_USER'), requireEnv(password, 'SAUCE_PASSWORD'));
    await loginPage.verifyError('Epic sadface: Sorry, this user has been locked out.');
});

test('Login with problem_user lands on inventory with incorrect duplicate images', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(problemUser, 'PROBLEM_USER'), requireEnv(password, 'SAUCE_PASSWORD'));
    await expect(page).toHaveURL('/inventory.html');

    const itemImages = page.locator('.inventory_item img.inventory_item_img');
    const firstImg = itemImages.nth(0);
    const secondImg = itemImages.nth(1);
    await expect(firstImg).toBeVisible();
    await expect(secondImg).toBeVisible();

    await expect.poll(async () => resolvedImageUrl(firstImg)).not.toBe('');
    await expect.poll(async () => resolvedImageUrl(secondImg)).not.toBe('');

    const src0 = await resolvedImageUrl(firstImg);
    const src1 = await resolvedImageUrl(secondImg);
    expect(src0).toBe(src1);
});

test('Login with performance_glitch_user lands on inventory', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(
        requireEnv(performanceGlitchUser, 'PERFORMANCE_GLITCH_USER'),
        requireEnv(password, 'SAUCE_PASSWORD'),
    );
    await expect(page).toHaveURL('/inventory.html', { timeout: 60_000 });
});

test('Login with visual_user lands on inventory', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(visualUser, 'VISUAL_USER'), requireEnv(password, 'SAUCE_PASSWORD'));
    await expect(page).toHaveURL('/inventory.html');
});

test('Eror user login issue after login', async ({page, loginPage }) => {
    await loginPage.goto();
    await loginPage.authenticate(requireEnv(errorUser, 'ERROR_USER'), requireEnv(password, 'SAUCE_PASSWORD'));
    await expect(page).toHaveURL('/inventory.html');
    await expect((page.locator(".inventory_item_name[data-test='inventory-item-name']")).nth(5)).toHaveText('Test.allTheThings() T-Shirt (Red)');
});