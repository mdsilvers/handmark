import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

test.describe('Authentication Flow', () => {
  test('should allow teacher to login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(dashboardPage.heading).toBeVisible()
  })

  test('should show error message for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('wrong@test.com', 'wrongpassword')

    // Error message should appear
    await loginPage.waitForError()
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText(/invalid/i)
  })

  test('should prevent login with empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    
    // Try to submit without filling fields
    await loginPage.loginButton.click()

    // Should show validation errors or disable button
    const emailInput = loginPage.emailInput
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('should successfully logout', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    // Login first
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    await expect(page).toHaveURL(/.*dashboard/)

    // Logout
    await dashboardPage.logout()

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)
  })

  test('should persist session on page reload', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    // Login
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    await expect(page).toHaveURL(/.*dashboard/)

    // Reload page
    await page.reload()

    // Should still be logged in
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(dashboardPage.heading).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)

    // Try to access dashboard without login
    await dashboardPage.goto()

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
  })
})
