import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import {
  downloadPdf,
  openBlankEditor,
  openExample,
  readPdf,
  step,
  waitForSave,
} from './helpers.ts'
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
        await expect(actual).toContainText(
          'No missing passages or text outside the paper edges found.',
        )
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
    test('explains missing PDF characters and omitted links, preserves edits and allows a corrected download', async ({
      page,
      isMobile,
    }, testInfo) => {
      test.setTimeout(90000)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      await openBlankEditor(page)
      await step(page, 'Personal details')
      await page
        .getByLabel('Full name', { exact: true })
        .fill('PDF Quality Reader')
      await page.getByLabel('Email', { exact: true }).fill('invalid-email')
      await page
        .getByLabel('Website or portfolio', { exact: true })
        .fill('not a web address')
      await step(page, 'Profile')
      const profile = 'Delivered results 🚀 with clear measurements.'
      await page
        .getByLabel('Your professional profile', { exact: true })
        .fill(profile)
      await waitForSave(page)
      await page.reload()
      await step(page, 'Profile')
      await expect(
        page.getByLabel('Your professional profile', { exact: true }),
      ).toHaveValue(profile)
      if (isMobile)
        await page.getByRole('button', { name: 'Preview', exact: true }).click()
      await page.getByRole('button', { name: 'Text', exact: true }).click()
      await page
        .getByRole('button', { name: 'Check PDF text', exact: true })
        .click()
      const actual = page.getByRole('region', {
        name: 'Text extracted from PDF',
      })
      await expect(actual).toHaveAttribute('aria-busy', 'false')
      await expect(actual).toContainText('Passages not found: 1')
      await expect(actual).toContainText('Link targets to check: 2')
      await expect(actual.getByRole('link')).toHaveCount(0)
      await actual
        .getByRole('button', { name: 'Link targets to check: 2', exact: true })
        .click()
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      await page.screenshot({
        path: testInfo.outputPath('pdf-check-warnings.png'),
      })
      await page.getByRole('button', { name: 'Download PDF' }).first().click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toContainText('Link targets to check: 2')
      await dialog
        .getByRole('button', { name: 'Link targets to check: 2', exact: true })
        .click()
      await expect(dialog).toContainText(
        'This link will be left out of the PDF.',
      )
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      await page.screenshot({ path: testInfo.outputPath('link-warnings.png') })
      await dialog.getByRole('button', { name: 'Back to editing' }).click()
      await expect(dialog).toHaveCount(0)
      await actual.getByRole('button', { name: 'Edit Profile' }).click()
      await expect(
        page
          .locator('.editor-form')
          .getByRole('heading', { name: 'Profile', exact: true }),
      ).toBeFocused()
      await expect(
        page.getByLabel('Your professional profile', { exact: true }),
      ).toHaveValue(profile)
      const corrected = 'Delivered results with clear measurements.'
      await page
        .getByLabel('Your professional profile', { exact: true })
        .fill(corrected)
      await step(page, 'Personal details')
      await page
        .getByLabel('Email', { exact: true })
        .fill('reader+cv@example.com')
      await page
        .getByLabel('Website or portfolio', { exact: true })
        .fill('example.com/portfolio')
      if (isMobile)
        await page.getByRole('button', { name: 'Preview', exact: true }).click()
      // A mobile form visit remounts the preview; desktop keeps its Text state.
      await page.getByRole('button', { name: 'Text', exact: true }).click()
      const toggle = page.getByRole('button', {
        name: 'Check PDF text',
        exact: true,
      })
      if ((await toggle.getAttribute('aria-expanded')) !== 'true')
        await toggle.click()
      await expect(actual).toHaveAttribute('aria-busy', 'false')
      await expect(actual).toContainText(
        'No missing passages or text outside the paper edges found.',
      )
      await expect(actual.locator('.pdf-link-warnings')).toHaveCount(0)
      await expect(
        actual.getByRole('link', {
          name: 'https://example.com/portfolio',
          exact: true,
        }),
      ).toBeVisible()
      await expect(
        actual.getByRole('link', {
          name: 'mailto:reader%2Bcv@example.com',
          exact: true,
        }),
      ).toBeVisible()
      const pdf = await readPdf(await downloadPdf(page, 'For sharing'))
      expect(pdf.text).toContain(corrected)
      expect(pdf.text).toContain('reader+cv@example.com')
      expect(pdf.text).toContain('example.com/portfolio')
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBe(0)
      expect(errors).toEqual([])
    })
  })
}
