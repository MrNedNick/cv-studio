import { expect, test, type Locator } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { downloadPdf, openExample, step } from './helpers.ts'

async function frames(element: Locator) {
  return element.evaluate(async (el) => {
    const heights: number[] = []
    for (let i = 0; i < 4; i++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      )
      heights.push(el.getBoundingClientRect().height)
    }
    return heights
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const reduced of ['no-preference', 'reduce'] as const) {
    test.describe(`${theme} / ${reduced}`, () => {
      test.use({ colorScheme: theme, reducedMotion: reduced })
      test('panels close before removal, reverse cleanly and return focus', async ({
        page,
        isMobile,
      }) => {
        test.setTimeout(60000)
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        await page.goto('./components.html')
        const toggle = page.getByRole('button', { name: 'Expandable details' })
        const body = page.locator('.gallery-disclosure .collapse')
        await toggle.click()
        await expect(body).toBeVisible()
        const openingHeights = await frames(body)
        await page.waitForFunction(() =>
          document
            .querySelector('.gallery-disclosure .collapse')
            ?.getAnimations()
            .every((a) => a.playState !== 'running'),
        )
        const full = await body.evaluate(
          (el) => el.getBoundingClientRect().height,
        )
        if (reduced === 'no-preference')
          expect(Math.min(...openingHeights)).toBeLessThan(full)
        await toggle.click()
        await expect(body).toHaveAttribute('inert', '')
        const heights = await frames(body)
        if (reduced === 'no-preference') {
          expect(Math.min(...heights)).toBeLessThan(full)
          expect(Math.max(...heights)).toBeGreaterThan(0)
        }
        await toggle.click()
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(
          page.getByLabel('A field inside the expanded block'),
        ).toBeVisible()
        await toggle.click()
        await expect(body).not.toBeVisible()
        const opener = page.getByRole('button', {
          name: 'Open dialog',
          exact: true,
        })
        await opener.click()
        await page.getByRole('dialog').press('Escape')
        await expect(page.locator('dialog.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(opener).toBeFocused()
        await opener.click()
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'Close dialog', exact: true })
          .click()
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(opener).toBeFocused()

        await openExample(page)
        await step(page, 'Experience')
        const gotIt = page.getByRole('button', { name: 'Got it', exact: true })
        await expect(gotIt).toBeVisible()
        await gotIt.click()
        const entry = page.locator('.entry-card').first()
        const entryToggle = entry.locator('.entry-toggle')
        await entryToggle.click()
        await expect(entry.locator(':scope > .collapse')).not.toBeVisible()
        await entryToggle.click()
        await expect(entry.locator(':scope > .collapse')).toBeVisible()
        const writing = page.getByRole('button', {
          name: 'How to write this section',
        })
        await writing.click()
        await page
          .getByRole('dialog', {
            name: 'How to write: Experience',
            exact: true,
          })
          .press('Escape')
        await expect(page.locator('dialog.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(writing).toBeFocused()
        const actions = page.getByRole('button', {
          name: 'Resume actions',
          exact: true,
        })
        await actions.click()
        await page.keyboard.press('Escape')
        await expect(page.locator('#document-menu.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('#document-menu')).toHaveCount(0)
        await expect(actions).toBeFocused()
        if (isMobile) {
          const picker = page.getByRole('button', {
            name: 'Resume steps',
            exact: true,
          })
          await picker.click()
          await page.getByRole('dialog').press('Escape')
          await expect(page.locator('dialog.is-closing')).toHaveAttribute(
            'inert',
            '',
          )
          await expect(page.locator('dialog')).toHaveCount(0)
          await expect(picker).toBeFocused()
        }
        await downloadPdf(page, 'For sharing')
        await expect(page.locator('.backup-toast')).toBeVisible()
        await page.getByRole('button', { name: 'Dismiss notification' }).click()
        await expect(page.locator('.backup-toast.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('.backup-toast')).toHaveCount(0)
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.playState !== 'running'),
        )
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
        expect(errors).toEqual([])
      })
    })
  }
}
