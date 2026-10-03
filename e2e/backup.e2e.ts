import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { downloadPdf, openExample, readPdf, step } from './helpers.ts'

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('a sharing download offers a restorable backup of the latest edits', async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openExample(page)
      const sharing = await readPdf(await downloadPdf(page, 'For sharing'))
      expect(sharing.attachments).toEqual([])
      const toast = page.locator('.backup-toast')
      await expect(toast).toContainText('PDF downloaded for sharing')
      if (theme === 'light') await page.waitForTimeout(7500)
      await expect(toast).toBeVisible()
      for (const width of [320, 430]) {
        await page.setViewportSize({ width, height: 739 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0)
        const box = (await toast
          .getByRole('button', { name: 'Editable copy', exact: true })
          .boundingBox())!
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await step(page, 'Personal details')
      await page.getByLabel('Full name', { exact: true }).fill('Latest Backup')
      await toast
        .getByRole('button', { name: 'Editable copy', exact: true })
        .click()
      const dialog = page.getByRole('dialog')
      await expect(
        dialog.getByRole('radio', { name: /Editable copy/ }),
      ).toBeChecked()
      await expect(
        dialog.getByRole('button', { name: 'Save JSON backup' }),
      ).toBeEnabled()
      const [backup] = await Promise.all([
        page.waitForEvent('download'),
        dialog
          .getByRole('button', {
            name: theme === 'light' ? 'Save JSON backup' : 'Download',
            exact: true,
          })
          .click(),
      ])
      let path: string
      if (theme === 'light') {
        expect(backup.suggestedFilename()).toBe('resume.json')
        path = (await backup.path())!
        const document = JSON.parse(await readFile(path, 'utf8')).cvStudio
        expect(document.versions.en.basics.name).toBe('Latest Backup')
        expect(document.versions.ru.basics.name).toBe('Александра Морозова')
      } else {
        const pdf = await readPdf(backup)
        expect(pdf.text).toContain('Latest Backup')
        expect(pdf.attachments).toEqual(['neatcv.json'])
        path = pdf.path
      }
      await expect(toast).not.toBeVisible()
      const picker = page.getByRole('button', {
        name: 'Resume steps',
        exact: true,
      })
      if (await picker.isVisible()) await picker.click()
      await page.getByRole('button', { name: 'Clear everything' }).click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Start new' })
        .click()
      await page.getByLabel('Open resume file').setInputFiles(path)
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Open resume', exact: true })
        .click()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Latest Backup',
      )
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Latest Backup',
      )
      expect(errors).toEqual([])
    })
  })
}
