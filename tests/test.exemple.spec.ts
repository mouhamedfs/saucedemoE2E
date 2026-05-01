import {test, expect} from '@playwright/test'

test("Verify session info", async ({page}) => {
    await page.goto('/inventory.html');
    const title = page.locator('.app_logo');
    await expect(title).toBeVisible();
})