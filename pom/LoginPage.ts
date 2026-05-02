import {Page, Locator,expect} from '@playwright/test';


export class LoginPage {
    protected readonly username: Locator;
    protected readonly password: Locator;
    protected readonly loginButton: Locator;
    protected readonly errorBox: Locator;

    constructor(public readonly page: Page) {
        // Use stable app attributes so this works both in tests and globalSetup.
        this.username = page.getByTestId('username');
        this.password = page.getByTestId('password');
        this.loginButton = page.getByTestId('login-button');
        this.errorBox = page.locator("h3[data-test='error']");
    }
    async goto() {
        return this.page.goto('/');
    }
    async authenticate(user: string, pass: string) {
        await this.username.fill(user);
        await this.password.fill(pass);
        await this.loginButton.click();
    }
    async exitPage(){
        await this.page.close();
    }
    async verifyError(error: string) {
        await expect(this.errorBox).toHaveText(error);
    }
}