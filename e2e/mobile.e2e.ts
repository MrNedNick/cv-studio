import { expect, test } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import {
  downloadPdf,
  openBlankEditor,
  openExample,
  readPdf,
  step,
  waitForSave,
} from './helpers.ts'

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('step picker is accessible and restores focus', async ({ page }) => {
      await openExample(page)
      const picker = page.getByRole('button', {
        name: 'Resume steps',
        exact: true,
      })
      await picker.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState !== 'running'),
      )
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await expect(picker).toBeFocused()
      await picker.click()
      await page
        .getByRole('navigation', { name: 'Resume steps' })
        .getByRole('button', { name: 'Projects', exact: true })
        .click()
      await expect(
        page.getByRole('heading', { name: 'Projects', exact: true }),
      ).toBeFocused()
    })
    test('writes, navigates, previews and exports on a touch phone', async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openBlankEditor(page)
      // No hidden PDF renderer/font download while writing on the phone.
      expect(await page.locator('.preview-panel canvas').count()).toBe(0)
      await page.getByRole('button', { name: 'Next: Personal details' }).click()
      await page.getByLabel('Full name', { exact: true }).fill('Mobile Tester')
      await page.getByLabel('Job title or speciality').fill('Frontend engineer')
      await page.getByLabel('Email', { exact: true }).fill('mobile@example.com')
      await page.getByLabel('City and country').fill('Prague, Czechia')
      await step(page, 'Experience')
      await page
        .getByLabel('Job title', { exact: true })
        .fill('Product engineer')
      await page.getByLabel('Company', { exact: true }).fill('Example Studio')
      await page.getByLabel('Start date').fill('2023-01')
      await page.getByRole('switch', { name: 'Present' }).check({ force: true })
      await page
        .getByLabel('Achievements and impact')
        .fill('Improved completion by 25%')
      await step(page, 'Skills')
      await page.getByLabel('Your skills').fill('React, TypeScript,')
      await step(page, 'Languages')
      await page.getByLabel('Language', { exact: true }).selectOption('de')
      await page.getByRole('button', { name: 'C1', exact: true }).click()
      await page.getByRole('button', { name: 'Resume actions' }).click()
      await expect(
        page.getByRole('button', { name: 'Undo', exact: true }),
      ).toBeEnabled()
      await page.getByRole('button', { name: 'Undo', exact: true }).click()
      await page.getByRole('button', { name: 'Resume actions' }).click()
      await page.getByRole('button', { name: 'Redo', exact: true }).click()
      await waitForSave(page)
      await page.reload()
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Mobile Tester',
      )
      await page.getByRole('button', { name: 'Preview', exact: true }).click()
      await expect(
        page.getByRole('img', { name: 'Resume, page 1' }),
      ).toBeVisible()
      await page.getByRole('button', { name: 'Zoom in' }).click()
      await page.getByRole('button', { name: 'Text', exact: true }).click()
      await expect(page.locator('.resume-text')).toContainText(
        'Product engineer',
      )
      // A step selected from the preview returns to the form.
      await step(page, 'Review')
      await expect(
        page.getByRole('heading', { name: 'Review & finish', exact: true }),
      ).toBeVisible()
      const pdf = await readPdf(await downloadPdf(page, 'Editable copy'))
      expect(pdf.text).toContain('Mobile Tester')
      expect(pdf.text).toContain('Improved completion by 25%')
      expect(pdf.attachments).toEqual(['neatcv.json'])
      await page
        .getByRole('button', { name: 'Resume steps', exact: true })
        .click()
      await page.getByRole('button', { name: 'Clear everything' }).click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Start new' })
        .click()
      await page.getByLabel('Open resume file').setInputFiles(pdf.path)
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Open resume', exact: true })
        .click()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Mobile Tester',
      )
      expect(errors).toEqual([])
    })
  })
}

test('all steps stay reachable at narrow, tablet and landscape sizes', async ({
  page,
}) => {
  // Forty step changes and five PDF renders need a larger budget on CI WebKit.
  test.setTimeout(90_000)
  await openExample(page)
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [430, 739],
    [768, 1024],
    [932, 430],
  ]) {
    await page.setViewportSize({ width, height })
    for (const name of [
      'Personal details',
      'Experience',
      'Education',
      'Skills',
      'Projects',
      'Languages',
      'Review',
      'Template',
    ]) {
      await step(page, name)
      await expect(page.locator('.editor-form h1')).toHaveText(
        name === 'Review' ? 'Review & finish' : name,
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
        `${width} ${name}`,
      ).toBeLessThanOrEqual(0)
      const next = page.locator('.form-footer .button').last()
      await expect(next).toBeInViewport()
      const box = (await next.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1)
    }
    await page.getByRole('button', { name: 'Preview', exact: true }).click()
    await expect(
      page.getByRole('img', { name: 'Resume, page 1' }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(0)
  }
})

test('adapts the workspace to a smaller visual viewport without changing pinch zoom', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const viewport = new EventTarget()
    Object.assign(viewport, { height: 739, scale: 1 })
    Object.defineProperty(window, 'visualViewport', { value: viewport })
  })
  await openBlankEditor(page)
  await page.getByRole('button', { name: 'Next: Personal details' }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Keyboard Test')
  await page.evaluate(() => {
    Object.assign(window.visualViewport!, { height: 400 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect(page.locator('.app-shell')).toHaveCSS('height', '400px')
  await expect(page.locator('.form-footer .button').last()).toBeInViewport()
  await page.evaluate(() => {
    Object.assign(window.visualViewport!, { height: 200, scale: 2 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect(page.locator('.app-shell')).toHaveCSS('height', '400px')
  await page.evaluate(() => {
    Object.assign(window.visualViewport!, { height: 739, scale: 1 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
    'Keyboard Test',
  )
})
