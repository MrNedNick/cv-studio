import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const theme of ['light', 'dark'] as const) {
  test.describe(`about / ${theme}`, () => {
    test.use({ colorScheme: theme })
    test('explains authorship and free downloads in six languages without disrupting navigation', async ({
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
      await page.goto('./')
      const about = page.locator('#about')
      const titles = {
        de: 'Ein guter Lebenslauf sollte nicht an einer Bezahlschranke enden.',
        es: 'Un buen currículum no debería terminar en una pantalla de pago.',
        bg: 'Доброто CV не трябва да завършва с екран за плащане.',
        uk: 'Гарне резюме не має закінчуватися екраном оплати.',
        ru: 'Хорошее резюме не должно упираться в оплату.',
        en: 'A good resume shouldn’t end at a checkout.',
      }
      for (const [locale, title] of Object.entries(titles)) {
        await page.locator('.language-button select').selectOption(locale)
        await expect(about.getByRole('heading', { name: title })).toBeVisible()
        await about.scrollIntoViewIfNeeded()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        expect(
          (await new AxeBuilder({ page }).include('#about').analyze())
            .violations,
        ).toEqual([])
      }
      await expect(about.locator('.maker-name')).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/mrnednick/',
      )
      await expect(
        about.getByRole('link', { name: 'See the source on GitHub' }),
      ).toHaveAttribute('href', 'https://github.com/MrNedNick/cv-studio')
      await expect(
        about.getByRole('link', { name: 'See the source on GitHub' }),
      ).toHaveAttribute('rel', 'noreferrer')
      await about.screenshot({ path: testInfo.outputPath('about.png') })
      await about.getByRole('link', { name: 'Privacy', exact: true }).click()
      await expect(page).toHaveURL(/\/privacy.html$/)
      await page.locator('.privacy-back').click()
      await page.getByRole('button', { name: 'Create your resume' }).click()
      await expect(page).toHaveURL(/#\/edit$/)
      expect(errors).toEqual([])
    })
  })
}
