import { expect, test } from '@playwright/test'
import { step, waitForSave } from './helpers.ts'
import {
  homePath,
  publicLocales,
  publicMetadata,
  publicUrl,
} from '../src/public-pages.ts'

test('changing language inside an editor opened from a localized address keeps that choice and text on reload', async ({
  page,
}) => {
  await page.goto('/es/?ref=telegram')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.locator('.hero-actions .button.primary').click()
  await expect(page.locator('.editor-toolbar')).toBeVisible()
  const select = page.locator('.language-button select')
  await select.selectOption('en')
  await expect(page).toHaveURL(/\/\?ref=telegram#\/edit$/)
  await step(page, 'Personal details')
  const name = page.getByLabel('Full name', { exact: true })
  await name.fill('Address reader')
  await waitForSave(page)
  await page.reload()
  await expect(select).toHaveValue('en')
  await step(page, 'Personal details')
  await expect(name).toHaveValue('Address reader')
  await select.selectOption('de')
  await expect(page).toHaveURL(/\/de\/\?ref=telegram#\/edit$/)
  await select.selectOption('en')
  await expect(name).toHaveValue('Address reader')
  await page.reload()
  await expect(select).toHaveValue('en')
  await step(page, 'Personal details')
  await expect(name).toHaveValue('Address reader')
})

for (const result of ['success', 'failed', 'manual choice'] as const) {
  test(`deferred saved language: ${result} never switches a resume after writing has started`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('language-restore-test')) {
        localStorage.setItem('neatcv-locale', 'de')
        localStorage.setItem('language-restore-test', '1')
      }
    })
    let release!: () => void
    const hold = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/de-*.js', async (route) => {
      await hold
      if (result === 'failed') await route.abort()
      else await route.continue()
    })
    try {
      // The held dictionary can delay WebKit's load event; inspect the UI
      // while it is pending instead of waiting for that request to finish.
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      const select = page.locator('.language-button select')
      await expect(select).toHaveAttribute('aria-busy', 'true')
      const create = page.getByRole('button', { name: 'Create your resume' })
      await expect(create).toBeDisabled()
      if (result === 'success') {
        const editor = page.getByRole('link', { name: 'Editor', exact: true })
        const headerAvailable = await editor.isVisible()
        if (headerAvailable) {
          await editor.click()
          await expect(
            page.getByText('Opening the editor…', { exact: true }),
          ).toBeVisible()
          await expect(page.locator('.editor-form')).toHaveCount(0)
        }
        release()
        await expect(select).toHaveValue('de')
        await select.selectOption('en')
        if (headerAvailable)
          await page.getByRole('button', { name: /A blank resume/ }).click()
        else await create.click()
      } else if (result === 'failed') {
        release()
        await expect(select).toHaveAttribute('aria-busy', 'false')
        await expect(create).toBeEnabled()
        await create.click()
      } else {
        await select.selectOption('en')
        await expect(create).toBeEnabled()
        await create.click()
      }
      await step(page, 'Personal details')
      const name = page.getByLabel('Full name', { exact: true })
      await name.fill('Early writer')
      release()
      await waitForSave(page)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(name).toHaveValue('Early writer')
      await page.reload()
      await step(page, 'Personal details')
      await expect(name).toHaveValue('Early writer')
    } finally {
      release()
    }
  })
}

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
