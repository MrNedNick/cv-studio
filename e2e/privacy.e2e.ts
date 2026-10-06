import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { step } from './helpers.ts'

const configured = Boolean(process.env.VITE_UMAMI_WEBSITE_ID)
test.beforeEach(async ({ context }) => {
  if (!configured) return
  await context.route(
    process.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js',
    (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'window.__privacyEvents=[];window.umami={track(p){window.__privacyEvents.push(p)}};',
      }),
  )
})

for (const theme of ['light', 'dark'] as const) {
  test.describe(`privacy / ${theme}`, () => {
    test.use({ colorScheme: theme })
    test('standalone notice works without resume storage in every language and after reload', async ({
      page,
      isMobile,
    }, testInfo) => {
      test.setTimeout(90000)
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      const errors: string[] = []
      const requested: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text())
      })
      page.on('request', (r) => requested.push(r.url()))
      await page.addInitScript(() => {
        Object.defineProperty(indexedDB, 'open', {
          value: () => {
            throw new Error('Privacy opened resume storage')
          },
        })
      })
      await page.goto('./privacy.html?ref=linkedin-profile#umami')
      await expect(
        page.getByRole('heading', {
          name: 'Your resume stays on your device.',
        }),
      ).toBeVisible()
      await expect(
        page
          .locator('#umami')
          .getByText(
            configured
              ? 'Configured in this build'
              : 'Prepared · currently disabled',
            { exact: true },
          ),
      ).toBeVisible()
      await expect(
        page
          .locator('#sentry')
          .getByText(
            process.env.VITE_SENTRY_DSN
              ? 'Configured in this build'
              : 'Prepared · currently disabled',
            { exact: true },
          ),
      ).toBeVisible()
      await expect(page).toHaveTitle('Privacy — NeatCV')
      const selector = page.locator('.language-button select')
      const titles = {
        de: 'Datenschutz',
        es: 'Privacidad',
        bg: 'Поверителност',
        uk: 'Приватність',
        ru: 'Приватность',
        en: 'Privacy',
      }
      for (const [locale, title] of Object.entries(titles)) {
        await selector.selectOption(locale)
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
        await expect(page).toHaveTitle(`${title} — NeatCV`)
        await expect(page.locator('.privacy-contents strong')).not.toHaveText(
          locale === 'en' ? 'На этой странице' : 'On this page',
        )
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        expect(
          await page.locator('.privacy-contents a span').evaluateAll((items) =>
            items.every((item) => {
              const number = document.createRange()
              number.selectNodeContents(item)
              return number.getClientRects().length === 1
            }),
          ),
        ).toBe(true)
        await page.getByRole('navigation').locator('a[href="#sentry"]').click()
        await expect(page.locator('#sentry h2')).toBeInViewport()
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
      }
      await page.getByRole('button', { name: 'Toggle color theme' }).click()
      const next = theme === 'light' ? 'dark' : 'light'
      await expect(page.locator('html')).toHaveAttribute('data-theme', next)
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('data-theme', next)
      await expect(page).toHaveTitle('Privacy — NeatCV')
      expect(
        requested.some((url) =>
          /\/assets\/(Editor|pdf|pdf-reader|Preview)-.*\.js(?:\?|$)/.test(url),
        ),
      ).toBe(false)
      if (!configured) {
        expect(
          requested.filter(
            (url) => new URL(url).origin !== new URL(page.url()).origin,
          ),
        ).toEqual([])
        await expect(page.locator('#neatcv-analytics')).toHaveCount(0)
      }
      expect(errors).toEqual([])
      await page.goto('./privacy.html')
      await page.screenshot({
        path: testInfo.outputPath('privacy-page.png'),
      })
      await page.screenshot({
        path: testInfo.outputPath('privacy-full.png'),
        fullPage: true,
      })
    })

    test('home links open the notice and the editor link preserves the current resume', async ({
      page,
      context,
      isMobile,
    }) => {
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      await page.goto('./')
      await page.locator('.promise-privacy').click()
      await expect(page).toHaveURL(/\/privacy.html$/)
      await page.locator('.privacy-back').click()
      await page.getByRole('button', { name: 'Create your resume' }).click()
      await step(page, 'Personal details')
      await page.getByLabel('Full name', { exact: true }).fill('Privacy Reader')
      await page
        .getByRole('button', { name: 'Resume actions', exact: true })
        .click()
      const link = page.getByRole('link', {
        name: 'Privacy — opens in a new tab',
        exact: true,
      })
      const [notice] = await Promise.all([
        context.waitForEvent('page'),
        link.click(),
      ])
      await expect(
        notice.getByRole('heading', {
          name: 'Your resume stays on your device.',
        }),
      ).toBeVisible()
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Privacy Reader',
      )
      await page.waitForTimeout(450)
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Privacy Reader',
      )
      await notice.close()
      await page.goto('./')
      await page
        .locator('.site-footer')
        .getByRole('link', { name: 'Privacy', exact: true })
        .click()
      await expect(page).toHaveURL(/\/privacy.html$/)
    })
  })
}

test('the notice remains readable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(new URL('privacy.html', baseURL).href)
  await expect(
    page.getByRole('heading', { name: 'Privacy — NeatCV' }),
  ).toBeVisible()
  await expect(
    page.getByText(/Sentry error reporting is optional/),
  ).toBeVisible()
  await context.close()
})

test('blocked browser storage still permits reading and changing the notice language', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable')
      },
    })
    Object.defineProperty(indexedDB, 'open', {
      value() {
        throw new Error('Resume storage unavailable')
      },
    })
  })
  await page.goto('./privacy.html')
  await expect(
    page.getByRole('heading', { name: 'Your resume stays on your device.' }),
  ).toBeVisible()
  await page.locator('.language-button select').selectOption('ru')
  await expect(
    page.getByRole('heading', { name: 'Резюме остаётся на вашем устройстве.' }),
  ).toBeVisible()
  const before = await page.locator('html').getAttribute('data-theme')
  await page.getByRole('button', { name: 'Переключить тему' }).click()
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    before === 'light' ? 'dark' : 'light',
  )
})
