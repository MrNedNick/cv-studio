import { expect, test } from '@playwright/test'
import { downloadPdf, openExample, readPdf, step } from './helpers.ts'

test('PDF loads smaller fonts for supported scripts and complete fonts for wider text without losing names', async ({
  page,
}) => {
  test.setTimeout(90000)
  const fontBytes = new Map<string, number>()
  page.on('response', async (response) => {
    const path = new URL(response.url()).pathname
    if (/\/fonts\/.*\.ttf$/.test(path) && response.ok()) {
      try {
        fontBytes.set(path, (await response.body()).length)
      } catch {
        /* A cancelled old preview is irrelevant. */
      }
    }
  })
  await openExample(page)
  await step(page, 'Personal details')
  const name = page.getByLabel('Full name', { exact: true })
  await name.fill('ÄĆŁŠ Жї Ελένη')
  const core = await readPdf(await downloadPdf(page, 'For sharing'))
  await expect(page.locator('dialog')).toHaveCount(0)
  expect(core.text.replace(/\s+/g, ' ')).toContain('ÄĆŁŠ Жї Ελένη')
  const paths = [...fontBytes.keys()]
  expect(paths.length).toBeGreaterThan(0)
  expect(paths.every((path) => path.endsWith('-core.ttf'))).toBe(true)
  expect(
    [...fontBytes.values()].reduce((sum, bytes) => sum + bytes, 0),
  ).toBeLessThan(1000000)
  await name.fill('Hồng')
  const fallback = await readPdf(await downloadPdf(page, 'For sharing'))
  await expect(page.locator('dialog')).toHaveCount(0)
  expect(fallback.text).toContain('Hồng')
  expect(
    [...fontBytes.keys()].some((path) => /-(Regular|Bold)\.ttf$/.test(path)),
  ).toBe(true)
  await name.fill('Зоя Йорданова')
  const again = await readPdf(await downloadPdf(page, 'For sharing'))
  expect(again.text.replace(/\s+/g, ' ')).toContain('Зоя Йорданова')
  expect(again.pages).toBe(core.pages)
})
