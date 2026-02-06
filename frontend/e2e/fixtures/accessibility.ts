import { test as base } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type AccessibilityFixtures = {
  makeAxeBuilder: () => AxeBuilder
}

export const test = base.extend<AccessibilityFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#commonly-reused-element-with-known-issue')
    await use(makeAxeBuilder)
  },
})

export { expect } from '@playwright/test'
