import { expect, test, type Page } from '@playwright/test'
import { step } from './helpers.ts'

const dsn = process.env.VITE_SENTRY_DSN?.trim()
const configured = Boolean(dsn)
const endpoint = (() => {
  if (!dsn) return ''
  const url = new URL(dsn)
  const parts = url.pathname.split('/').filter(Boolean)
  const project = parts.pop()
  return `${url.origin}/${parts.length ? parts.join('/') + '/' : ''}api/${project}/envelope/**`
})()
const umamiScript = process.env.VITE_UMAMI_WEBSITE_ID
  ? process.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'
  : ''
test.beforeEach(async ({ context }) => {
  if (umamiScript)
    await context.route(umamiScript, (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'window.umami={track(){}};',
      }),
    )
})
const privateText = 'Fictional Private Resume 9371'
const privateEmail = 'fictional-private-9371@example.test'

async function error(page: Page, rejection = false) {
  await page.evaluate(
    ({ privateText, privateEmail, rejection }) => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[type="module"][src]',
      )!.src
      const failure = new TypeError(
        `${privateText} ${privateEmail} Private-Resume.pdf`,
      )
      failure.stack = `TypeError: ${privateText}\n at ${privateText} (${script}?email=${privateEmail}#${encodeURIComponent(privateText)}:11:22)\n at secret (https://private.example.test/Private-Resume.pdf:1:2)`
      if (rejection) {
        void Promise.reject(failure)
      } else
        setTimeout(() => {
          throw failure
        }, 0)
    },
    { privateText, privateEmail, rejection },
  )
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Sentry / ${theme}`, () => {
    test.use({ colorScheme: theme })
    test('has no SDK or outgoing reports without DSN', async ({
      page,
      isMobile,
    }) => {
      test.skip(configured, 'Uses the default disabled build')
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      const urls: string[] = []
      page.on('request', (r) => urls.push(r.url()))
      await page.goto('./')
      await error(page)
      await page.getByRole('button', { name: 'Create your resume' }).click()
      await step(page, 'Personal details')
      await page.getByLabel('Full name', { exact: true }).fill(privateText)
      await page.waitForTimeout(450)
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        privateText,
      )
      expect(urls.some((url) => /sentry-client|\/envelope\//.test(url))).toBe(
        false,
      )
      expect(
        urls.filter(
          (url) =>
            new URL(url).origin !== new URL(page.url()).origin &&
            url !== umamiScript,
        ),
      ).toEqual([])
    })

    test('real SDK envelopes omit resume input, messages, file names, URL parameters and user context', async ({
      page,
      context,
      isMobile,
    }) => {
      test.skip(
        !configured,
        'Uses an isolated fixture build with a public test DSN',
      )
      if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
      const reports: { body: string; headers: Record<string, string> }[] = []
      await context.route(endpoint, async (route) => {
        reports.push({
          body: route.request().postData() ?? '',
          headers: await route.request().allHeaders(),
        })
        await route.fulfill({
          status: 200,
          headers: { 'access-control-allow-origin': '*' },
          contentType: 'application/json',
          body: '{}',
        })
      })
      await page.goto(
        `./?name=${encodeURIComponent(privateText)}#/edit?email=${privateEmail}`,
      )
      await page.getByRole('button', { name: 'A blank resume' }).click()
      await step(page, 'Personal details')
      await page.getByLabel('Full name', { exact: true }).fill(privateText)
      await page.getByLabel('Email', { exact: true }).fill(privateEmail)
      await error(page)
      await error(page, true)
      await expect.poll(() => reports.length).toBe(2)
      for (const report of reports) {
        expect(report.body).not.toMatch(
          /Fictional|9371|Private-Resume|private\.example|email=|name=|breadcrumbs|contexts|extra|"user"|"trace"|attachment|session|recording/,
        )
        expect(report.headers.referer).toBeUndefined()
        expect(report.headers.cookie).toBeUndefined()
        const lines = report.body
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line))
        expect(lines).toHaveLength(3)
        expect(Object.keys(lines[0]).sort()).toEqual(['event_id', 'sent_at'])
        expect(lines[1]).toEqual({ type: 'event' })
        expect(lines[2].tags.route).toBe('/edit')
        expect(lines[2].exception.values[0].type).toBe('TypeError')
        expect(lines[2].exception.values[0].value).toBe(
          'Application error; private details omitted',
        )
        expect(lines[2].exception.values[0].stacktrace.frames).toHaveLength(1)
        expect(lines[2].exception.values[0].stacktrace.frames[0]).toMatchObject(
          { lineno: 11, colno: 22, in_app: true },
        )
      }
      await page.waitForTimeout(450)
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        privateText,
      )
    })
  })
}

test('React crash reports omit private messages and leave the saved backup available', async ({
  page,
  context,
  browser,
  isMobile,
}) => {
  test.skip(!configured, 'Uses the configured fixture build')
  const reports: string[] = []
  await page.goto('./')
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await step(page, 'Personal details')
  await page.getByLabel('Full name', { exact: true }).fill(privateText)
  await expect(
    page.getByText('Saved in this browser', { exact: true }),
  ).toBeVisible()
  const crashing = await browser.newContext({
    storageState: await context.storageState({ indexedDB: true }),
    viewport: page.viewportSize()!,
    isMobile,
    hasTouch: isMobile,
    locale: 'en-US',
  })
  const crashPage = await crashing.newPage()
  if (umamiScript)
    await crashing.route(umamiScript, (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'window.umami={track(){}};',
      }),
    )
  await crashing.route(endpoint, async (route) => {
    reports.push(route.request().postData() ?? '')
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      body: '{}',
    })
  })
  await crashing.route('**/assets/Editor-*.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export default function BrokenEditor(){throw new TypeError(${JSON.stringify(privateText + ' ' + privateEmail)})}`,
    }),
  )
  await crashPage.goto(page.url())
  await expect(
    crashPage.getByRole('heading', {
      name: 'Something went wrong',
      exact: true,
    }),
  ).toBeVisible()
  await expect
    .poll(() => reports.some((report) => report.includes('react_boundary')))
    .toBe(true)
  expect(reports.join('\n')).not.toMatch(
    /9371|Fictional|fictional-private|Private-Resume/,
  )
  const [download] = await Promise.all([
    crashPage.waitForEvent('download'),
    crashPage.getByRole('button', { name: 'Download a copy (JSON)' }).click(),
  ])
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  expect(Buffer.concat(chunks).toString()).toContain(privateText)
  await crashing.close()
})

for (const control of ['dnt', 'gpc'] as const) {
  test(`respects ${control} before downloading the SDK`, async ({
    page,
    context,
  }) => {
    test.skip(!configured, 'Requires configured DSN')
    const urls: string[] = []
    context.on('request', (r) => urls.push(r.url()))
    await page.addInitScript((control) => {
      Object.defineProperty(
        navigator,
        control === 'dnt' ? 'doNotTrack' : 'globalPrivacyControl',
        { value: control === 'dnt' ? '1' : true },
      )
    }, control)
    await page.goto('./privacy.html')
    await expect(
      page.getByRole('heading', { name: 'Your resume stays on your device.' }),
    ).toBeVisible()
    await error(page)
    await page.waitForTimeout(150)
    expect(urls.some((url) => /sentry-client|\/envelope\//.test(url))).toBe(
      false,
    )
  })
}

test('a privacy control enabled after SDK loading prevents delivery', async ({
  page,
  context,
}) => {
  test.skip(!configured, 'Requires configured DSN')
  let requests = 0
  await context.route(endpoint, (route) => {
    requests++
    return route.fulfill({ status: 200, body: '{}' })
  })
  await page.goto('./')
  await expect
    .poll(() =>
      page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .some((entry) => entry.name.includes('/sentry-client-')),
      ),
    )
    .toBe(true)
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }),
  )
  await error(page)
  await error(page, true)
  await page.waitForTimeout(300)
  expect(requests).toBe(0)
})

test('a blocked reporting endpoint never blocks editing or creates a report loop', async ({
  page,
  context,
}) => {
  test.skip(!configured, 'Requires configured DSN')
  let requests = 0
  await context.route(endpoint, (route) => {
    requests++
    return route.abort('failed')
  })
  await page.goto('./')
  await error(page)
  await expect.poll(() => requests).toBe(1)
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await step(page, 'Personal details')
  await page.getByLabel('Full name', { exact: true }).fill(privateText)
  await page.waitForTimeout(450)
  expect(requests).toBe(1)
  await page.reload()
  await step(page, 'Personal details')
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    privateText,
  )
})
