import { expect, test, type Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import {
  openBlankEditor,
  openExample,
  readPdf,
  step,
  waitForSave,
} from './helpers.ts'

const tip = (page: Page) =>
  page.getByRole('dialog', { name: 'Editor tip', exact: true })
const help = (page: Page) => page.locator('.guide-access button')
async function guide(page: Page) {
  if (await help(page).isVisible()) await help(page).click()
  else {
    await page
      .getByRole('button', { name: 'Resume actions', exact: true })
      .click()
    await page
      .locator('#document-menu')
      .getByRole('button', { name: 'Editor guide' })
      .click()
  }
  return page.getByRole('dialog', { name: 'Editor guide', exact: true })
}
async function choose(page: Page, title: string) {
  const dialog = await guide(page)
  const topic = dialog
    .locator('.disclosure')
    .filter({ has: page.locator('.disclosure-summary', { hasText: title }) })
  await topic.locator('.disclosure-summary').click()
  await topic.getByRole('button', { name: 'Show in editor' }).click()
}
async function positioned(page: Page, topic: string) {
  await expect(tip(page)).toHaveAttribute('data-guide-topic', topic)
  await expect(tip(page)).toBeVisible()
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const cardElement = document.querySelector('.guide-floating')
        const targetElement = document.querySelector('.guide-spotlight')
        if (!cardElement || !targetElement) return false
        const card = cardElement.getBoundingClientRect()
        const target = targetElement.getBoundingClientRect()
        const within =
          card.x >= 0 &&
          card.y >= 0 &&
          card.right <= innerWidth + 1 &&
          card.bottom <= innerHeight + 1
        const overlap =
          Math.min(card.right, target.right) >
            Math.max(card.left, target.left) &&
          Math.min(card.bottom, target.bottom) > Math.max(card.top, target.top)
        return within && !overlap
      }),
    )
    .toBe(true)
  await expect(page.locator('.guide-tip:visible')).toHaveCount(1)
}
async function axe(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
}
for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme })
    test('walkthrough points to real controls and completes with an editable PDF', async ({
      page,
      isMobile,
    }, testInfo) => {
      test.setTimeout(90000)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openBlankEditor(page)
      await positioned(page, 'design')
      await axe(page)
      await page.screenshot({
        path: testInfo.outputPath('onboarding-start.png'),
      })
      await page
        .locator('.design-options')
        .getByRole('button', { name: /^Classic/ })
        .click()
      await expect(tip(page)).not.toBeVisible()
      await page
        .locator('.design-options')
        .getByRole('button', { name: /^Compact/ })
        .click()
      const introduction = await guide(page)
      await introduction
        .getByRole('button', { name: 'Walk me through the editor' })
        .click()
      await expect(tip(page)).toContainText('STEP 1 / 8')
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'basics')
      await expect(
        tip(page).getByRole('button', { name: 'Next', exact: true }),
      ).toBeFocused()
      await page
        .getByLabel('Full name', { exact: true })
        .fill('Walkthrough Tester')
      await expect(page.getByLabel('Full name', { exact: true })).toBeFocused()
      await expect(tip(page)).not.toBeVisible()
      await page
        .getByLabel('Job title or speciality', { exact: true })
        .fill('Frontend engineer')
      await expect(
        page.getByLabel('Job title or speciality', { exact: true }),
      ).toBeFocused()
      await page.getByRole('button', { name: 'Continue walkthrough' }).click()
      await positioned(page, 'basics')
      await page.screenshot({
        path: testInfo.outputPath('onboarding-writing.png'),
      })
      const actions = page.getByRole('button', {
        name: 'Resume actions',
        exact: true,
      })
      await actions.click()
      await expect(tip(page)).not.toBeVisible()
      await page.keyboard.press('Escape')
      await expect(actions).toBeFocused()
      await positioned(page, 'basics')
      if (isMobile) {
        const picker = page.getByRole('button', {
          name: 'Resume steps',
          exact: true,
        })
        await picker.click()
        await expect(tip(page)).not.toBeVisible()
        await page.keyboard.press('Escape')
        await expect(picker).toBeFocused()
        await positioned(page, 'basics')
      }
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'structure')
      await page
        .getByRole('button', { name: 'How to write this section' })
        .click()
      const writing = page.getByRole('dialog', {
        name: 'How to write: Experience',
        exact: true,
      })
      await expect(writing).toBeVisible()
      await expect(tip(page)).not.toBeVisible()
      await writing
        .getByRole('button', { name: 'Close', exact: true })
        .press('Escape')
      await positioned(page, 'structure')
      await tip(page).getByRole('button', { name: 'Back', exact: true }).click()
      await positioned(page, 'basics')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Walkthrough Tester',
      )
      const viewport = page.viewportSize()!
      if (!isMobile) {
        await page.setViewportSize({ width: viewport.width, height: 600 })
        await expect
          .poll(() =>
            page.locator('.editor-form').evaluate((form) => form.clientHeight),
          )
          .toBeLessThan(600)
      }
      await page.locator('.editor-form').evaluate((form) => {
        form.scrollTop = form.scrollHeight
      })
      await expect(tip(page)).not.toBeVisible()
      await page.getByRole('button', { name: 'Continue walkthrough' }).click()
      if (!isMobile) await page.setViewportSize(viewport)
      await positioned(page, 'basics')
      await expect(
        tip(page).getByRole('button', { name: 'Next', exact: true }),
      ).toBeFocused()
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'skills')
      await page
        .getByLabel('Your skills', { exact: true })
        .fill('TypeScript, Accessibility,')
      await page.getByLabel('Your skills', { exact: true }).press('Enter')
      await expect(page.locator('.skill-tags li span')).toHaveText([
        'TypeScript',
        'Accessibility',
      ])
      await page.getByRole('button', { name: 'Continue walkthrough' }).click()
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'languages')
      await page
        .locator('.level-chips')
        .first()
        .getByRole('button', { name: 'B2', exact: true })
        .click()
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'versions')
      await expect(page.locator('.site-header select')).toHaveAttribute(
        'aria-describedby',
        /editor-coach-description/,
      )
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'review')
      await page
        .getByLabel('Job posting text')
        .fill('TypeScript and Accessibility')
      await page.getByRole('button', { name: 'Continue walkthrough' }).click()
      await tip(page).getByRole('button', { name: 'Next', exact: true }).click()
      await positioned(page, 'preview')
      await page.getByRole('button', { name: 'Text', exact: true }).click()
      await expect(tip(page)).not.toBeVisible()
      await expect(page.locator('.resume-text')).toContainText(
        'Walkthrough Tester',
      )
      await axe(page)
      await page.getByRole('button', { name: 'Continue walkthrough' }).click()
      await positioned(page, 'preview')
      await tip(page)
        .getByRole('button', { name: 'Download PDF', exact: true })
        .click()
      const downloadDialog = page.getByRole('dialog', {
        name: 'Download your resume',
        exact: true,
      })
      await expect(
        downloadDialog.getByRole('radio', { name: /For sharing/ }),
      ).toBeChecked()
      await downloadDialog.getByRole('radio', { name: /Editable copy/ }).check()
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadDialog
          .getByRole('button', { name: 'Download', exact: true })
          .click(),
      ])
      const pdf = await readPdf(download)
      expect(pdf.text).toContain('Walkthrough Tester')
      expect(pdf.text).toContain('TypeScript')
      expect(pdf.attachments).toHaveLength(1)
      await waitForSave(page)
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Walkthrough Tester',
      )
      await expect(tip(page)).not.toBeVisible()
      expect(errors).toEqual([])
    })
    test('automatic help yields to typing, opt-out persists and help can be restarted', async ({
      page,
    }) => {
      await openBlankEditor(page)
      await tip(page)
        .getByRole('button', { name: 'Dismiss this editor tip' })
        .click()
      await expect(help(page)).toBeFocused()
      await step(page, 'Personal details')
      await positioned(page, 'basics')
      await page
        .getByLabel('Full name', { exact: true })
        .fill('Keep my writing')
      await expect(tip(page)).not.toBeVisible()
      await expect(page.getByLabel('Full name', { exact: true })).toBeFocused()
      let dialog = await guide(page)
      await dialog
        .getByRole('switch', { name: 'Contextual editor tips' })
        .uncheck()
      await dialog
        .getByRole('button', { name: 'Close', exact: true })
        .press('Escape')
      await expect(help(page)).toBeFocused()
      await waitForSave(page)
      await page.reload()
      await step(page, 'Skills')
      await expect(tip(page)).not.toBeVisible()
      await choose(page, 'Add several skills at once')
      await positioned(page, 'skills')
      await tip(page)
        .getByRole('button', { name: 'Got it', exact: true })
        .click()
      await expect(
        page.getByLabel('Your skills', { exact: true }),
      ).toBeFocused()
      dialog = await guide(page)
      await dialog
        .getByRole('button', { name: 'Walk me through the editor' })
        .click()
      await positioned(page, 'design')
      await tip(page)
        .getByRole('button', { name: 'Skip walkthrough' })
        .press('Escape')
      await expect(tip(page)).not.toBeVisible()
      await page.reload()
      await step(page, 'Personal details')
      await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(
        'Keep my writing',
      )
      await expect(tip(page)).not.toBeVisible()
      dialog = await guide(page)
      await dialog
        .getByRole('button', { name: 'Restore dismissed editor tips' })
        .click()
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
      await positioned(page, 'basics')
      await axe(page)
    })
  })
}
test('example and hidden sections keep their recovery controls', async ({
  page,
}) => {
  await openExample(page)
  await expect(page.locator('[data-guide-topic="design"]')).toHaveCount(0)
  await step(page, 'Experience')
  await positioned(page, 'structure')
  await page
    .locator('.section-head')
    .getByRole('switch', { name: 'In resume', exact: true })
    .uncheck()
  await expect(tip(page)).not.toBeVisible()
  await page.getByRole('button', { name: 'Show it', exact: true }).click()
  await expect(page.locator('.entry-card').first()).toContainText(
    'Product designer',
  )
  await positioned(page, 'structure')
})
test('floating help fits narrow and landscape screens in six languages', async ({
  page,
}) => {
  test.setTimeout(90000)
  await openBlankEditor(page)
  for (const size of [
    { width: 320, height: 780 },
    { width: 360, height: 780 },
    { width: 430, height: 932 },
    { width: 932, height: 430 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(size)
    await choose(page, 'Start with the look')
    await positioned(page, 'design')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0)
  }
  await page.setViewportSize({ width: 320, height: 780 })
  await choose(page, 'Start with the look')
  for (const [locale, title, toggle] of [
    ['de', 'Hilfe zum Editor', 'Hinweise beim Bearbeiten'],
    ['es', 'Ayuda del editor', 'Consejos durante la edición'],
    ['bg', 'Помощ за редактора', 'Подсказки по време на редактиране'],
    ['uk', 'Допомога з редактором', 'Підказки під час роботи'],
    ['ru', 'Помощь по редактору', 'Подсказки по ходу работы'],
    ['en', 'Editor guide', 'Contextual editor tips'],
  ]) {
    await page.locator('.site-header select').selectOption(locale)
    await expect(help(page)).toHaveText(title)
    await help(page).click()
    const dialog = page.getByRole('dialog', { name: title, exact: true })
    await expect(dialog.getByRole('switch', { name: toggle })).toBeChecked()
    await expect(dialog.locator('.disclosure-summary')).toHaveCount(8)
    await axe(page)
    await dialog.locator('.dialog-head button').press('Escape')
    await expect(help(page)).toBeFocused()
    const box = await page.locator('.guide-floating:visible').boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(321)
  }
})
