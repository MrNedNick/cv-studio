import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { downloadPdf, openExample, readPdf, step } from './helpers.ts'
for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('extracted preview matches the downloaded PDF and follows edits and templates', async ({
      page,
      isMobile,
    }, testInfo) => {
      test.setTimeout(60000)
      await openExample(page)
      for (const template of ['Classic', 'Editorial']) {
        await step(page, 'Template')
        await page
          .locator('.design-options')
          .getByRole('button', { name: new RegExp(`^${template}`) })
          .click()
        await step(page, 'Personal details')
        await page
          .getByLabel('Full name', { exact: true })
          .fill(`PDF Reader ${template}`)
        if (isMobile)
          await page
            .getByRole('button', { name: 'Preview', exact: true })
            .click()
        await page.getByRole('button', { name: 'Text', exact: true }).click()
        const details = page.locator('.pdf-text-check')
        const toggle = details.getByRole('button', { name: 'Check PDF text' })
        if ((await toggle.getAttribute('aria-expanded')) !== 'true')
          await toggle.click()
        const actual = page.getByRole('region', {
          name: 'Text extracted from PDF',
        })
        await expect(actual).toHaveAttribute('aria-busy', 'false')
        await expect(actual.locator('pre').first()).toContainText(
          `PDF Reader ${template}`,
        )
        await expect(
          actual.getByRole('link', {
            name: 'mailto:alex@example.com',
            exact: true,
          }),
        ).toBeVisible()
        const pdf = await readPdf(await downloadPdf(page, 'For sharing'))
        const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
        expect(
          normalize((await actual.locator('pre').allTextContents()).join(' ')),
        ).toBe(normalize(pdf.text))
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.playState !== 'running'),
        )
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
      }
      await page.setViewportSize({ width: 320, height: 780 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBe(0)
      await page.screenshot({
        path: testInfo.outputPath('pdf-text-review.png'),
      })
    })
  })
}
