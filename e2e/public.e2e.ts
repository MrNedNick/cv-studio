import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { step } from './helpers.ts'
import { templates } from '../src/template-data.ts'

for (const saved of ['light', 'dark'] as const) {
  test(`saved ${saved} colors apply to static content before the application module arrives`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: saved === 'dark' ? 'light' : 'dark',
    })
    await page.addInitScript(
      (value) => localStorage.setItem('neatcv-theme', value),
      saved,
    )
    let release!: () => void
    const hold = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/assets/app-*.js', async (route) => {
      await hold
      await route.continue()
    })
    try {
      await page.goto('/templates/modern/', { waitUntil: 'commit' })
      await expect(
        page.getByRole('heading', { name: 'Modern', exact: true }),
      ).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', saved)
      await expect(page.locator('html')).not.toHaveAttribute(
        'data-theme-animated',
      )
      await expect
        .poll(() =>
          page.evaluate(
            () => getComputedStyle(document.documentElement).backgroundColor,
          ),
        )
        .toBe(saved === 'dark' ? 'rgb(21, 31, 27)' : 'rgb(252, 252, 248)')
    } finally {
      release()
    }
    await expect(
      page.getByRole('button', { name: 'Use Modern template' }),
    ).toBeEnabled()
    await expect(page.locator('html')).toHaveAttribute('data-theme', saved)
  })
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`public pages / ${theme}`, () => {
    test.use({ colorScheme: theme })
    test('static templates and guide attach cleanly, fit 360px and keep saved text when a design is chosen', async ({
      page,
      isMobile,
    }, testInfo) => {
      test.setTimeout(90000)
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text())
      })
      await page.goto('./templates/')
      await expect(page.locator('.template-caption h2')).toHaveCount(12)
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
            .analyze()
        ).violations,
      ).toEqual([])
      await expect(
        page.getByRole('heading', {
          name: 'Great experience deserves great presentation.',
        }),
      ).toBeVisible()
      for (const item of templates) {
        await page
          .getByRole('link', { name: `About ${item.name}`, exact: true })
          .click()
        await expect(
          page.getByRole('heading', { name: item.name, exact: true }),
        ).toBeVisible()
        await expect(page).toHaveTitle(
          `${item.name} resume template — free PDF | NeatCV`,
        )
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        await page.locator('.template-page > a').click()
      }
      await page
        .getByRole('link', { name: 'About Modern', exact: true })
        .click()
      await page.screenshot({
        path: testInfo.outputPath('template.png'),
        fullPage: true,
      })
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page
        .getByRole('button', { name: 'Use Modern template', exact: true })
        .click()
      await step(page, 'Personal details')
      await page
        .getByLabel('Full name', { exact: true })
        .fill('Template Reader')
      await expect(
        page.getByText('Saved in this browser', { exact: true }),
      ).toBeVisible()
      await page.goto('./templates/classic/')
      await page
        .getByRole('button', { name: 'Use Classic template', exact: true })
        .click()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Template Reader',
      )
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Template Reader',
      )
      await page.goto('./help/')
      await expect(
        page.getByRole('heading', { name: 'How NeatCV works', exact: true }),
      ).toBeVisible()
      const questions = page.locator('.faq-answer h3')
      expect(await questions.count()).toBe(6)
      const structured = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts
            .map((s) => JSON.parse(s.textContent!))
            .find((s) => s['@type'] === 'FAQPage'),
        )
      expect(
        structured.mainEntity.map((q: { name: string }) => q.name),
      ).toEqual(await questions.allTextContents())
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.locator('.language-button select').selectOption('ru')
      await expect(
        page.getByRole('heading', { name: 'Как работает NeatCV', exact: true }),
      ).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      expect(errors).toEqual([])
    })
  })
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('all template information and FAQ answers are readable with real navigation', async ({
    page,
  }) => {
    await page.goto('./')
    await page
      .getByRole('link', { name: 'Explore templates', exact: true })
      .click()
    await expect(
      page.getByRole('heading', {
        name: 'Great experience deserves great presentation.',
      }),
    ).toBeVisible()
    await page
      .getByRole('link', { name: 'About Editorial', exact: true })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Editorial', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByText('This template has two columns.', { exact: false }),
    ).toBeVisible()
    await page
      .locator('.site-footer')
      .getByRole('link', { name: 'How NeatCV works' })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Where is my resume stored?' }),
    ).toBeVisible()
    await expect(
      page.getByText(/NeatCV does not upload resume text/),
    ).toBeVisible()
  })
})
