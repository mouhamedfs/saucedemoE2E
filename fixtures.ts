import {test as base} from "@playwright/test";
import {LoginPage} from "./pom/LoginPage";

type MyFixtures = {
    loginPage: LoginPage;
}

export const test  = base.extend<MyFixtures>({
    loginPage: async ({page}, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
        await loginPage.exitPage();
    }
});

export { expect } from '@playwright/test';