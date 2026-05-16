import {test, expect} from '../fixtures'

test("Verify session info", async ({page, inventoryPage}) => {
    await inventoryPage.goto();
    const title = page.locator('.app_logo');
    await expect(title).toBeVisible();
})
test('Add item to cart', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addFirstItemToCart();
});