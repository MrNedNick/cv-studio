import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('real component states work without changing stored resumes', async ({
      page,
      browserName,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await page.goto('./components.html')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Small details. Consistent care.',
      )
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      expect(await page.evaluate(() => indexedDB.databases())).toEqual([])
      const fields = page.locator('#fields')
      const email = fields.getByLabel('Email — blur to validate', {
        exact: true,
      })
      await email.focus()
      await email.press('Tab')
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await email.fill('alex@example.com')
      await expect(email).not.toHaveAttribute('aria-invalid')
      await expect(
        page.getByLabel('Unavailable field', { exact: true }),
      ).toBeDisabled()
      await expect(
        page.getByLabel('Unavailable choice', { exact: true }),
      ).toBeDisabled()
      await expect(
        page.getByRole('switch', { name: 'Unavailable switch' }),
      ).toBeDisabled()
      const included = page.getByRole('switch', {
        name: 'Include this section',
      })
      await included.focus()
      await included.press('Space')
      await expect(included).not.toBeChecked()
      await page
        .getByLabel('Text density', { exact: true })
        .selectOption('compact')
      const loading = page.getByRole('button', { name: 'Try loading state' })
      await loading.click()
      await expect(
        page.getByRole('button', { name: 'Preparing…' }),
      ).toBeDisabled()
      await expect(
        page.getByRole('status').filter({ hasText: 'Example action complete' }),
      ).toBeVisible()
      const skills = page.getByLabel('Your skills', { exact: true })
      await skills.fill('Keyboard testing')
      await skills.press('Enter')
      await page
        .getByRole('button', { name: 'Remove “Keyboard testing”' })
        .click()
      await expect(
        page.getByRole('button', { name: 'Remove “Keyboard testing”' }),
      ).toHaveCount(0)
      await page
        .getByRole('switch', { name: 'Disable template choices' })
        .check()
      await expect(page.locator('.template-card:disabled')).toHaveCount(12)
      await page
        .getByRole('switch', { name: 'Disable template choices' })
        .uncheck()
      await page
        .locator('.template-card')
        .filter({ hasText: 'Classic' })
        .first()
        .click()
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: 'Selected template: classic' }),
      ).toBeVisible()
      for (const width of [320, 430]) {
        await page.setViewportSize({ width, height: 739 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0)
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.playState !== 'running'),
        )
        expect(
          (await new AxeBuilder({ page }).exclude('.mini-resume').analyze())
            .violations,
        ).toEqual([])
      }
      const opener = page.getByRole('button', {
        name: 'Open dialog',
        exact: true,
      })
      await opener.focus()
      await opener.press('Enter')
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await dialog.getByLabel('Copy name').fill('A tailored copy')
      expect(
        await dialog.evaluate((element) => element.matches(':modal')),
      ).toBe(true)
      // macOS WebKit uses Option-Tab to include buttons in native navigation.
      const allControls =
        browserName === 'webkit' && process.platform === 'darwin'
      const nextControl = allControls ? 'Alt+Tab' : 'Tab'
      const previousControl = allControls ? 'Alt+Shift+Tab' : 'Shift+Tab'
      await dialog.getByLabel('Copy name').press(nextControl)
      await expect(
        dialog.getByRole('button', { name: 'Cancel', exact: true }),
      ).toBeFocused()
      await page.keyboard.press(nextControl)
      await expect(
        dialog.getByRole('button', { name: 'Save example copy' }),
      ).toBeFocused()
      await page.keyboard.press(previousControl)
      await expect(
        dialog.getByRole('button', { name: 'Cancel', exact: true }),
      ).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(opener).toBeFocused()
      await page.getByRole('button', { name: 'Dark theme' }).click()
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme === 'dark' ? 'light' : 'dark',
      )
      await page.reload()
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Alex Morgan',
      )
      expect(await page.evaluate(() => indexedDB.databases())).toEqual([])
      expect(errors).toEqual([])
    })
  })
}
