import {test as base} from "@playwright/test";
import {LoginPage} from "./pom/LoginPage";
import {InventoryPage} from "./pom/InventoryPage";

type MyFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage
}

export const test  = base.extend<MyFixtures>({
    loginPage: async ({page}, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
        await loginPage.exitPage();
    },
    inventoryPage: async ({page}, use) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await use(inventoryPage);
        await inventoryPage.exitPage();
    },
});

export { expect } from '@playwright/test';