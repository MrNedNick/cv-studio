import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { openExample, step } from './helpers.ts'

async function violations(page: Page) {
  const result = await new AxeBuilder({ page })
    // Template thumbnails are hidden pictures of a page, and PDF pages are
    // labelled canvases; their text is available in the text view.
    .exclude('.mini-resume')
    .exclude('canvas')
    .analyze()
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme })

    test('home page has no accessibility violations', async ({ page }) => {
      await page.goto('./')
      await expect(
        page.getByRole('button', { name: 'Create your resume' }),
      ).toBeVisible()
      expect(await violations(page)).toEqual([])
    })

    test('editor steps have no accessibility violations', async ({ page }) => {
      await openExample(page)
      expect(await violations(page)).toEqual([])
      for (const name of ['Experience', 'Skills', 'Review']) {
        await step(page, name)
        await page.waitForTimeout(400)
        expect(await violations(page), name).toEqual([])
      }
    })
  })
}
