import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { openBlankEditor, step, waitForSave } from './helpers.ts'

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('contact keyboard, validation and values survive navigation and reload', async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openBlankEditor(page)
      await step(page, 'Personal details')
      const name = page.getByLabel('Full name', { exact: true })
      const job = page.getByLabel('Job title or speciality')
      const email = page.getByLabel('Email', { exact: true })
      const phone = page.getByLabel('Phone', { exact: true })
      const city = page.getByLabel('City and country')
      const website = page.getByLabel('Website or portfolio')
      const linkedin = page.getByLabel('LinkedIn', { exact: true })
      const github = page.getByLabel('GitHub', { exact: true })
      await expect(name).toHaveAttribute('autocomplete', 'name')
      await expect(email).toHaveAttribute('autocomplete', 'email')
      await expect(email).toHaveAttribute('inputmode', 'email')
      await expect(phone).toHaveAttribute('autocomplete', 'tel')
      await expect(phone).toHaveAttribute('inputmode', 'tel')
      for (const link of [website, linkedin, github]) {
        await expect(link).toHaveAttribute('inputmode', 'url')
        await expect(link).toHaveAttribute('autocapitalize', 'none')
        await expect(link).toHaveAttribute('spellcheck', 'false')
      }
      await expect(linkedin).toHaveAttribute('autocomplete', 'off')
      await expect(github).toHaveAttribute('enterkeyhint', 'done')
      await name.fill('Keyboard Tester')
      await name.press('Enter')
      await expect(job).toBeFocused()
      await job.fill('Frontend engineer')
      await job.press('Enter')
      await expect(email).toBeFocused()
      await email.fill('wrong.address')
      await expect(email).not.toHaveAttribute('aria-invalid')
      await email.press('Enter')
      await expect(phone).toBeFocused()
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByRole('alert')).toContainText('Use @ and a domain')
      await email.fill('keyboard@example.com')
      await expect(email).not.toHaveAttribute('aria-invalid')
      await email.press('Enter')
      await phone.fill('(---)')
      await phone.press('Enter')
      await expect(city).toBeFocused()
      await expect(phone).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByRole('alert')).toContainText('at least six digits')
      await phone.fill('+49 (30) 1234-5678')
      await phone.press('Enter')
      await city.fill('Berlin, Germany')
      await city.press('Enter')
      await expect(website).toBeFocused()
      await website.fill('example.com/portfolio')
      await website.press('Enter')
      await expect(linkedin).toBeFocused()
      await expect(website).not.toHaveAttribute('aria-invalid')
      await linkedin.fill('linkedin.com/in/keyboard-tester')
      await linkedin.press('Enter')
      await expect(github).toBeFocused()
      await github.fill('ftp://example.com')
      await github.press('Enter')
      await expect(github).not.toBeFocused()
      await expect(github).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByRole('alert')).toContainText('Use a web address')
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await github.fill('github.com/keyboard-tester')
      await github.press('Enter')
      await expect(github).not.toHaveAttribute('aria-invalid')
      for (const width of [320, 430]) {
        await page.setViewportSize({ width, height: 739 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0)
      }
      await waitForSave(page)
      await page.reload()
      await step(page, 'Personal details')
      await expect(name).toHaveValue('Keyboard Tester')
      await expect(email).toHaveValue('keyboard@example.com')
      await expect(phone).toHaveValue('+49 (30) 1234-5678')
      await expect(website).toHaveValue('example.com/portfolio')
      await expect(github).toHaveValue('github.com/keyboard-tester')
      expect(errors).toEqual([])
    })
  })
}
