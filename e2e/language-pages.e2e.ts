import { expect, test } from '@playwright/test'
import {
  homePath,
  publicLocales,
  publicMetadata,
  publicUrl,
} from '../src/public-pages.ts'

test.describe('readable language pages', () => {
  test.use({ javaScriptEnabled: false })
  test('all six languages have complete HTML, their own metadata and reciprocal alternatives', async ({
    page,
  }) => {
    const headings = new Set<string>()
    for (const locale of publicLocales) {
      const path = homePath(locale)
      await page.goto(path === '/' ? '/' : path + '/')
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page).toHaveTitle(publicMetadata(path).title)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        publicUrl(path),
      )
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        publicMetadata(path).description,
      )
      await expect(page.locator('.hero h1')).toBeVisible()
      headings.add(await page.locator('.hero h1').innerText())
      for (const alternative of publicLocales)
        await expect(
          page.locator(`link[hreflang="${alternative}"]`),
        ).toHaveAttribute('href', publicUrl(homePath(alternative)))
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
        'href',
        publicUrl('/'),
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(0)
    }
    expect(headings.size).toBe(6)
  })
})

test('an explicit language address wins over saved preferences; switching keeps the query and survives reload', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.addInitScript(() => {
    if (!localStorage.getItem('language-route-test')) {
      localStorage.setItem('neatcv-locale', 'ru')
      localStorage.setItem('language-route-test', '1')
    }
  })
  await page.goto('/de/?ref=telegram')
  const select = page.locator('.language-button select')
  await expect(select).toHaveValue('de')
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await select.selectOption('es')
  await expect(page).toHaveURL(/\/es\/\?ref=telegram$/)
  await page.reload()
  await expect(select).toHaveValue('es')
  await expect(page).toHaveTitle(publicMetadata('/es').title)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    publicUrl('/es'),
  )
  await select.selectOption('en')
  await expect(page).toHaveURL(/\/\?ref=telegram$/)
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await expect(
    page.getByRole('heading', { name: 'Template', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Template', exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('data saver leaves the editor unloaded until it is opened', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    }),
  )
  const editorRequests: string[] = []
  page.on('request', (request) => {
    if (/\/Editor-[^/]+\.js/.test(request.url()))
      editorRequests.push(request.url())
  })
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Create your resume' }),
  ).toBeEnabled()
  await page.waitForTimeout(1700)
  expect(editorRequests).toEqual([])
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await expect(
    page.getByRole('heading', { name: 'Template', exact: true }),
  ).toBeVisible()
  expect(editorRequests).toHaveLength(1)
})
