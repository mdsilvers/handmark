import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly signUpLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.loginButton = page.getByRole('button', { name: /log in|sign in/i })
    this.errorMessage = page.getByRole('alert')
    this.signUpLink = page.getByRole('link', { name: /sign up|create account/i })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' })
  }
}
