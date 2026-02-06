import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should display dashboard heading', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await expect(dashboardPage.heading).toBeVisible()
  })

  test('should navigate to classes page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToClasses()
    
    await expect(page).toHaveURL(/.*classes/)
  })

  test('should navigate to assignments page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.navigateToAssignments()
    
    await expect(page).toHaveURL(/.*assignments/)
  })

  test('should display recent activity', async ({ page }) => {
    // Check for recent activity section
    const activitySection = page.getByRole('region', { name: /recent activity/i })
    await expect(activitySection).toBeVisible()
  })

  test('should display class statistics', async ({ page }) => {
    // Check for statistics cards
    const statsSection = page.getByRole('region', { name: /statistics|overview/i })
    await expect(statsSection).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const dashboardPage = new DashboardPage(page)
    
    // Dashboard should still be accessible
    await expect(dashboardPage.heading).toBeVisible()
    
    // Navigation might be in a hamburger menu on mobile
    const mobileMenu = page.getByRole('button', { name: /menu|navigation/i })
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(dashboardPage.classesLink).toBeVisible()
    }
  })

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 })
    
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.heading).toBeVisible()
    await expect(dashboardPage.classesLink).toBeVisible()
  })
})
