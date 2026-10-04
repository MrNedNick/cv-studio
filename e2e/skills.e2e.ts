import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { openBlankEditor, step, waitForSave } from './helpers.ts'

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('long skills fit a phone and keyboard removal returns to writing', async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openBlankEditor(page)
      await step(page, 'Skills')
      const input = page.getByLabel('Your skills', { exact: true })
      const longSkill = 'TypeScript'.repeat(20)
      const cyrillic = 'Исследование пользовательского опыта'
      await input.focus()
      await page.keyboard.insertText(`${longSkill}, ${cyrillic},`)
      await input.fill('Accessibility')
      await input.press('Enter')
      const removeLong = page.getByRole('button', {
        name: `Remove “${longSkill}”`,
        exact: true,
      })
      await expect(removeLong).toBeVisible()
      for (const width of [320, 360, 430]) {
        await page.setViewportSize({ width, height: 739 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0)
        const chip = page
          .locator('.skill-tags li')
          .filter({ hasText: longSkill })
        await expect(chip.locator('span')).toHaveText(longSkill)
        const box = await chip.boundingBox()
        const button = await removeLong.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        expect(button!.width).toBeGreaterThanOrEqual(44)
        expect(button!.height).toBeGreaterThanOrEqual(44)
      }
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await waitForSave(page)
      await page.reload()
      await step(page, 'Skills')
      await expect(removeLong).toBeVisible()
      await expect(page.locator('.skill-tags li span')).toHaveText([
        longSkill,
        cyrillic,
        'Accessibility',
      ])
      await removeLong.focus()
      await removeLong.press('Enter')
      await expect(input).toBeFocused()
      await input.fill('Research')
      await input.press('Enter')
      const research = page.getByRole('button', {
        name: 'Remove “Research”',
        exact: true,
      })
      await research.focus()
      await research.press('Space')
      await expect(input).toBeFocused()
      await input.press('Backspace')
      await expect(
        page.getByRole('button', {
          name: 'Remove “Accessibility”',
          exact: true,
        }),
      ).toHaveCount(0)
      await page
        .getByRole('button', { name: `Remove “${cyrillic}”`, exact: true })
        .press('Enter')
      await expect(input).toBeFocused()
      await expect(
        page.getByRole('list', { name: 'Added skills', exact: true }),
      ).toHaveCount(0)
      await input.fill('Design systems')
      await input.press('Enter')
      await waitForSave(page)
      await page.reload()
      await step(page, 'Skills')
      await expect(page.locator('.skill-tags li span')).toHaveText([
        'Design systems',
      ])
      expect(errors).toEqual([])
    })
  })
}
