import { test, expect } from './fixtures/accessibility'
import { LoginPage } from './pages/LoginPage'

test.describe('Accessibility Tests', () => {
  test('login page should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    const accessibilityScanResults = await makeAxeBuilder().analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('dashboard should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    // Login first
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    
    await page.waitForURL(/.*dashboard/)

    const accessibilityScanResults = await makeAxeBuilder().analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('class management page should have no accessibility violations', async ({ page, makeAxeBuilder }) => {
    // Login and navigate
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    
    await page.goto('/classes')

    const accessibilityScanResults = await makeAxeBuilder().analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support keyboard navigation on login form', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(loginPage.emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(loginPage.passwordInput).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(loginPage.loginButton).toBeFocused()

    // Should be able to submit with Enter
    await loginPage.emailInput.focus()
    await page.keyboard.type('teacher@test.com')
    await page.keyboard.press('Tab')
    await page.keyboard.type('password123')
    await page.keyboard.press('Enter')

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 })
  })

  test('should have proper focus indicators', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Focus on email input
    await loginPage.emailInput.focus()

    // Check that focus is visible (you may need to adjust this based on your CSS)
    const emailStyles = await loginPage.emailInput.evaluate((el) => {
      return window.getComputedStyle(el)
    })

    // Focus ring should be visible (outline or box-shadow)
    // This is a basic check - adjust based on your design system
    expect(emailStyles.outline !== 'none' || emailStyles.boxShadow !== 'none').toBeTruthy()
  })

  test('form errors should be announced to screen readers', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Submit form without filling it
    await loginPage.loginButton.click()

    // Error message should have role="alert" for screen reader announcement
    const errorMessage = page.getByRole('alert')
    await expect(errorMessage).toBeVisible()

    // Check aria-live attribute (alternative to role="alert")
    const ariaLive = await errorMessage.getAttribute('aria-live')
    expect(ariaLive === 'polite' || ariaLive === 'assertive' || await errorMessage.getAttribute('role') === 'alert').toBeTruthy()
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')

    // Find all images
    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt).not.toBeNull()
    }
  })

  test('headings should be properly structured', async ({ page }) => {
    await page.goto('/dashboard')

    // Get all headings
    const h1Count = await page.locator('h1').count()
    
    // There should be exactly one h1 per page
    expect(h1Count).toBe(1)

    // Check heading hierarchy (no skipped levels)
    const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    
    let previousLevel = 0
    for (const heading of allHeadings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase())
      const currentLevel = parseInt(tagName.charAt(1))
      
      // Heading level should not skip more than one level
      if (previousLevel > 0) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      }
      
      previousLevel = currentLevel
    }
  })

  test('interactive elements should have accessible names', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // All buttons should have accessible names
    const buttons = await page.getByRole('button').all()
    
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent()
      expect(accessibleName).toBeTruthy()
      expect(accessibleName?.trim().length).toBeGreaterThan(0)
    }

    // All form inputs should have labels
    const inputs = await page.locator('input').all()
    
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toBeAttached()
      } else {
        // Input should have aria-label if no id/label
        const ariaLabel = await input.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
      }
    }
  })

  test('color contrast should meet WCAG AA standards', async ({ page, makeAxeBuilder }) => {
    await page.goto('/dashboard')

    // Run accessibility check focusing on color contrast
    const accessibilityScanResults = await makeAxeBuilder()
      .withTags(['wcag2aa'])
      .analyze()

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    )

    expect(contrastViolations).toEqual([])
  })
})
