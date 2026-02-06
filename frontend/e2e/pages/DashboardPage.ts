import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly classesLink: Locator
  readonly assignmentsLink: Locator
  readonly profileButton: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /dashboard/i })
    this.classesLink = page.getByRole('link', { name: /classes/i })
    this.assignmentsLink = page.getByRole('link', { name: /assignments/i })
    this.profileButton = page.getByRole('button', { name: /profile/i })
    this.logoutButton = page.getByRole('button', { name: /log out|sign out/i })
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async logout() {
    await this.profileButton.click()
    await this.logoutButton.click()
  }

  async navigateToClasses() {
    await this.classesLink.click()
  }

  async navigateToAssignments() {
    await this.assignmentsLink.click()
  }
}
