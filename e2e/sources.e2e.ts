import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { downloadPdf, step } from './helpers.ts'

const key = 'neatcv-attribution'
const configured = Boolean(process.env.VITE_UMAMI_WEBSITE_ID)
type Stored = {
  first: { ref: string; at: number }
  last: { ref: string; at: number }
}
type TestWindow = Window & {
  __sourceEvents: Array<{
    name: string
    url: string
    data: Record<string, string>
  }>
}

async function stored(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as Stored,
    key,
  )
}
test.beforeEach(async ({ page }) => {
  if (!configured) return
  await page.route(
    process.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js',
    (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'window.__sourceEvents = []; window.umami = { track(payload) { window.__sourceEvents.push(payload); return Promise.resolve(); } };',
      }),
  )
})

for (const theme of ['light', 'dark'] as const) {
  test.describe(`source links / ${theme}`, () => {
    test.use({ colorScheme: theme })
    test('tagged visits survive reload and direct returns without entering backups', async ({
      page,
      isMobile,
    }) => {
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto('./?ref=reddit-resumes')
      const first = await stored(page)
      expect(first.last.ref).toBe('reddit-resumes')
      await page.getByRole('button', { name: 'Try an example' }).click()
      await step(page, 'Personal details')
      await page.getByLabel('Full name', { exact: true }).fill('Source Reader')
      await page.waitForTimeout(400)
      await page.goto('./#/edit')
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Source Reader',
      )
      expect(await stored(page)).toEqual(first)
      await page.goto('./?ref=telegram-launch#/edit')
      const last = await stored(page)
      expect(last.first).toEqual(first.first)
      expect(last.last.ref).toBe('telegram-launch')
      await page.goto('./?ref=not-a-platform#/edit')
      expect(await stored(page)).toEqual(last)
      await step(page, 'Personal details')
      await page
        .getByRole('button', { name: 'Resume actions', exact: true })
        .click()
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page
          .getByRole('button', { name: 'Save JSON backup', exact: true })
          .click(),
      ])
      const backup = JSON.parse(
        await readFile((await download.path())!, 'utf8'),
      )
      expect(backup.cvStudio.versions.en.basics.name).toBe('Source Reader')
      expect(JSON.stringify(backup)).not.toMatch(
        /neatcv-attribution|telegram-launch|reddit-resumes/,
      )
      expect(await stored(page)).toEqual(last)
      if (!configured)
        await expect(page.locator('#neatcv-analytics')).toHaveCount(0)
      expect(errors).toEqual([])
    })

    test('hash source links update in place and reject duplicate or private labels', async ({
      page,
    }) => {
      await page.goto('./#/edit?ref=LinkedIn-Profile')
      await expect(
        page.getByRole('heading', { name: 'The first step is simple.' }),
      ).toBeVisible()
      const first = await stored(page)
      expect(first.first.ref).toBe('linkedin-profile')
      await page.goto('./#/edit?ref=github-readme')
      await expect
        .poll(async () => (await stored(page)).last.ref)
        .toBe('github-readme')
      const recent = await stored(page)
      for (const suffix of [
        'ref=reddit&ref=telegram',
        'ref=reddit?ref=telegram',
        'ref=reddit-jane%40example.com',
        'ref=%3Cscript%3E',
        'ref=reddit--launch',
      ]) {
        await page.goto(`./#/edit?${suffix}`)
        expect(await stored(page)).toEqual(recent)
      }
      await page
        .getByRole('button', { name: /A blank resume/, exact: true })
        .click()
      await expect(
        page.getByRole('heading', { name: 'Template', exact: true }),
      ).toBeVisible()
    })

    test('configured tracking follows successful actions and excludes private values', async ({
      page,
    }) => {
      test.skip(!configured, 'Optional tracker ID is absent')
      test.setTimeout(60000)
      await page.goto('./?ref=reddit-launch&email=do-not-send%40example.com')
      await page.getByRole('button', { name: 'Try an example' }).click()
      await step(page, 'Personal details')
      await page
        .getByLabel('Full name', { exact: true })
        .fill('Private Resume Name')
      await page
        .getByRole('button', { name: 'Download PDF', exact: true })
        .click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Back to editing', exact: true })
        .click()
      expect(
        await page.evaluate(() =>
          (window as unknown as TestWindow).__sourceEvents.some(
            (e) => e.name === 'pdf_downloaded',
          ),
        ),
      ).toBe(false)
      await downloadPdf(page, 'For sharing')
      const events = await page.evaluate(
        () => (window as unknown as TestWindow).__sourceEvents,
      )
      expect(events.map((e) => e.name)).toEqual([
        'site_visit',
        'example_opened',
        'pdf_downloaded',
      ])
      for (const event of events)
        expect(event.data).toMatchObject({
          ref: 'reddit-launch',
          source: 'reddit',
          first_ref: 'reddit-launch',
        })
      expect(JSON.stringify(events)).not.toMatch(
        /Private Resume Name|do-not-send|email=/,
      )
      expect(events.at(-1)!.url).toBe('/edit')
      expect(events.at(-1)!.data.format).toBe('sharing')
      await page
        .getByRole('button', { name: 'Resume actions', exact: true })
        .click()
      const [json] = await Promise.all([
        page.waitForEvent('download'),
        page
          .getByRole('button', { name: 'Save JSON backup', exact: true })
          .click(),
      ])
      const path = (await json.path())!
      await page.getByLabel('Open resume file').setInputFiles(path)
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Cancel', exact: true })
        .click()
      expect(
        await page.evaluate(() =>
          (window as unknown as TestWindow).__sourceEvents.some(
            (e) => e.name === 'resume_imported',
          ),
        ),
      ).toBe(false)
      await page.getByLabel('Open resume file').setInputFiles(path)
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Open resume', exact: true })
        .click()
      await page
        .getByRole('button', { name: 'Resume actions', exact: true })
        .click()
      const text = page.waitForEvent('download')
      await page
        .getByRole('button', { name: 'Download .txt for forms', exact: true })
        .click()
      await text
      const completed = await page.evaluate(
        () => (window as unknown as TestWindow).__sourceEvents,
      )
      expect(completed.map((e) => e.name)).toEqual([
        'site_visit',
        'example_opened',
        'pdf_downloaded',
        'json_downloaded',
        'resume_imported',
        'text_downloaded',
      ])
      expect(
        completed.find((e) => e.name === 'resume_imported')!.data.format,
      ).toBe('json')
      expect(JSON.stringify(completed)).not.toMatch(
        /Private Resume Name|do-not-send|email=/,
      )
    })
  })
}

test('expired and corrupted source records do not interfere with a new visit', async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          first: { ref: 'reddit', at: 0 },
          last: { ref: 'reddit', at: 0 },
        }),
      ),
    key,
  )
  await page.goto('./')
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull()
  await page.goto('./?ref=telegram-launch')
  expect((await stored(page)).first.ref).toBe('telegram-launch')
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await expect(
    page.getByRole('heading', { name: 'Template', exact: true }),
  ).toBeVisible()
})
