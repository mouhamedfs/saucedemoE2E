import {Page, Locator,expect} from '@playwright/test';

export class InventoryPage {
    protected readonly inventory: Locator;
    protected readonly inventoryItem: Locator;
    protected readonly inventoryItemName: Locator;
    protected readonly inventoryItemPrice: Locator;
    protected readonly inventoryItemQuantity: Locator;
    protected readonly inventoryItemTotal: Locator;
    protected readonly addItemToCartButton: Locator;

    constructor(public readonly page: Page) {
        this.inventory = page.locator('.inventory_list');
        this.inventoryItem = page.locator('.inventory_item');
        this.inventoryItemName = page.locator('.inventory_item_name');
        this.inventoryItemPrice = page.locator('.inventory_item_price');
        this.inventoryItemQuantity = page.locator('.inventory_item_quantity');
        this.inventoryItemTotal = page.locator('.inventory_item_total');
        this.addItemToCartButton = page.locator('.btn_primary.btn_inventory');
    }
    async goto() {
        return this.page.goto('/inventory.html');
    }

    async addFirstItemToCart() {
        await this.addItemToCartButton.first().click();
    }
    async verifyInventory() {
        await expect(this.inventory).toBeVisible();
    }
    async exitPage(){
        await this.page.close();
    }
}