import { expect, test } from '@playwright/test'
import { openExample, step } from './helpers.ts'

test('loads only requested dictionaries and keeps the latest language choice', async ({
  page,
}) => {
  const requested: string[] = []
  page.on('request', (request) => {
    const file = new URL(request.url()).pathname.split('/').at(-1)!
    if (/^(de|es|bg|uk)-.*\.js$/.test(file)) requested.push(file.split('-')[0])
  })
  await openExample(page)
  await step(page, 'Personal details')
  await page.getByLabel('Email', { exact: true }).fill('languages@example.com')
  expect(requested).toEqual([])
  // A slow response must not overwrite a more recent selection.
  await page.route('**/de-*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.continue()
  })
  const select = page.locator('.language-button select')
  await select.selectOption('de')
  await select.selectOption('es')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.waitForTimeout(1000)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(
    page.getByLabel('Correo electrónico', { exact: true }),
  ).toHaveValue('languages@example.com')
  expect(requested.sort()).toEqual(['de', 'es'])
  for (const language of ['bg', 'uk', 'ru', 'en', 'de']) {
    await select.selectOption(language)
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(select).toHaveValue(language)
    for (const width of [320, 430]) {
      await page.setViewportSize({ width, height: 739 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
        language,
      ).toBeLessThanOrEqual(0)
      const sizes = await page
        .locator('.editor-form input:not([type="checkbox"]):not([type="file"])')
        .evaluateAll((inputs) =>
          inputs.map((input) => parseFloat(getComputedStyle(input).fontSize)),
        )
      expect(
        sizes.every((size) => size >= 16),
        language,
      ).toBe(true)
    }
  }
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await page.locator('.form-footer .button').last().click()
  await expect(page.getByLabel('E-Mail', { exact: true })).toHaveValue(
    'languages@example.com',
  )
})

test('a failed dictionary keeps the current form and does not save a failed choice', async ({
  page,
}) => {
  await openExample(page)
  await step(page, 'Personal details')
  await page.getByLabel('Email', { exact: true }).fill('safe@example.com')
  await page.route('**/uk-*.js', (route) => route.abort())
  await page.locator('.language-button select').selectOption('uk')
  await expect(
    page.getByText('Could not load this language. Reload and try again.'),
  ).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    'safe@example.com',
  )
  expect(
    await page.evaluate(() => localStorage.getItem('neatcv-locale')),
  ).toBeNull()
  await page.unroute('**/uk-*.js')
  await page.getByRole('button', { name: 'Reload', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Template', exact: true }),
  ).toBeVisible()
  await step(page, 'Personal details')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    'safe@example.com',
  )
  await page.locator('.language-button select').selectOption('uk')
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
})
