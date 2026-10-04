import { expect, test, type Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { openBlankEditor, openExample, step, waitForSave } from './helpers.ts'

const help = (page: Page) =>
  page.locator('.guide-access').getByRole('button', { name: 'Editor guide' })
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
  return page.getByRole('dialog', { name: 'Editor guide' })
}
async function choose(page: Page, title: string) {
  const dialog = await guide(page)
  const topic = dialog
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: title }) })
  await topic.locator('summary').click()
  await topic.getByRole('button', { name: 'Show in editor' }).click()
  await expect(dialog).not.toBeVisible()
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
    test('help is optional, persistent, keyboard accessible and keeps the latest writing', async ({
      page,
    }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`)
      })
      await openBlankEditor(page)
      await expect(page.getByRole('dialog')).not.toBeVisible()
      const tip = page.getByRole('complementary', { name: 'Editor tip' })
      await expect(tip).toContainText('example text until you write your own')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(1)
      await tip.getByRole('button', { name: 'Dismiss this editor tip' }).click()
      await expect(help(page)).toBeFocused()
      await step(page, 'Personal details')
      const name = page.getByLabel('Full name', { exact: true })
      await name.fill('Onboarding Tester')
      await expect(name).toBeFocused()
      await expect(tip).toContainText('clearing browser data')
      let dialog = await guide(page)
      await expect(
        dialog.getByRole('switch', { name: 'Contextual editor tips' }),
      ).toBeChecked()
      await axe(page)
      for (const width of [320, 360, 430]) {
        await page.setViewportSize({ width, height: 780 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0)
        const toggleBox = await dialog
          .locator('.switch-row label')
          .boundingBox()
        expect(toggleBox!.height).toBeGreaterThanOrEqual(44)
        const box = await dialog.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      }
      await dialog
        .getByRole('switch', { name: 'Contextual editor tips' })
        .uncheck()
      await dialog
        .getByRole('button', { name: 'Close', exact: true })
        .press('Escape')
      await expect(help(page)).toBeFocused()
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await expect(name).toHaveValue('Onboarding Tester')
      await waitForSave(page)
      await page.reload()
      await step(page, 'Skills')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await choose(page, 'Add several skills at once')
      await expect(page.locator('[data-guide-topic="skills"]')).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'Skills', exact: true }),
      ).toBeFocused()
      await page
        .getByLabel('Your skills', { exact: true })
        .fill('TypeScript, Accessibility,')
      await page.getByLabel('Your skills', { exact: true }).press('Enter')
      await expect(page.locator('.skill-tags li span')).toHaveText([
        'TypeScript',
        'Accessibility',
      ])
      await step(page, 'Personal details')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await expect(name).toHaveValue('Onboarding Tester')
      dialog = await guide(page)
      await expect(
        dialog.getByRole('switch', { name: 'Contextual editor tips' }),
      ).not.toBeChecked()
      await dialog
        .getByRole('switch', { name: 'Contextual editor tips' })
        .check()
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
      await step(page, 'Template')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      dialog = await guide(page)
      await dialog
        .getByRole('button', { name: 'Restore dismissed editor tips' })
        .click()
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
      await expect(page.locator('[data-guide-topic="design"]')).toBeVisible()
      await axe(page)
      await waitForSave(page)
      await page.reload()
      await step(page, 'Personal details')
      await expect(name).toHaveValue('Onboarding Tester')
      await expect(page.locator('[data-guide-topic="basics"]')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('onboarding.png') })
      expect(errors).toEqual([])
    })
    test('context matches hidden sections, language versions, examples, preview and sharing', async ({
      page,
      isMobile,
    }) => {
      await openExample(page)
      await expect(page.locator('.sample-banner')).toBeVisible()
      await expect(page.locator('[data-guide-topic="design"]')).toHaveCount(0)
      await step(page, 'Experience')
      await expect(page.locator('[data-guide-topic="structure"]')).toBeVisible()
      await page
        .locator('.section-head')
        .getByRole('switch', { name: 'In resume', exact: true })
        .uncheck()
      await expect(page.locator('.section-off')).toBeVisible()
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await page.getByRole('button', { name: 'Show it', exact: true }).click()
      await expect(page.locator('[data-guide-topic="structure"]')).toBeVisible()
      await page
        .locator('.guide-tip')
        .getByRole('button', { name: 'Dismiss this editor tip' })
        .click()
      await step(page, 'Education')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await choose(page, 'Another language, a separate version')
      await expect(page.locator('[data-guide-topic="versions"]')).toContainText(
        'translated automatically',
      )
      await step(page, 'Languages')
      await expect(
        page.locator('[data-guide-topic="languages"]'),
      ).toContainText('A1–C2')
      if (isMobile)
        await page.getByRole('button', { name: 'Preview', exact: true }).click()
      else await page.getByRole('button', { name: 'Form', exact: true }).click()
      await expect(
        page.locator('.preview-panel [data-guide-topic="preview"]'),
      ).toBeVisible()
      await page.setViewportSize({ width: 932, height: 430 })
      if (!isMobile)
        await page.getByRole('button', { name: 'Preview', exact: true }).click()
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await expect(
        page.getByRole('img', { name: 'Resume, page 1' }),
      ).toBeVisible()
      const previewHelp = await guide(page)
      await previewHelp
        .getByRole('button', { name: 'Close', exact: true })
        .press('Escape')
      await expect(
        page.getByRole('button', { name: 'Resume actions', exact: true }),
      ).toBeFocused()
      await page.setViewportSize({ width: isMobile ? 430 : 1440, height: 900 })
      if (isMobile)
        await page.getByRole('button', { name: 'Editor', exact: true }).click()
      else await page.getByRole('button', { name: 'Form', exact: true }).click()
      await choose(page, 'See what the reader will see')
      await expect(
        page.locator('.preview-panel [data-guide-topic="preview"]'),
      ).toBeVisible()
      await expect(page.locator('.guide-tip:visible')).toHaveCount(1)
      await page.setViewportSize({ width: 932, height: 430 })
      await expect(page.locator('[data-guide-topic="preview"]')).toBeVisible()
      await expect(
        page.getByRole('img', { name: 'Resume, page 1' }),
      ).toBeVisible()
      if (isMobile)
        await expect(
          page.getByRole('button', { name: 'Preview', exact: true }),
        ).toHaveAttribute('aria-pressed', 'true')
      await page
        .locator('.preview-panel .guide-tip')
        .getByRole('button', { name: 'Dismiss this editor tip' })
        .click()
      await expect(
        page.getByRole('button', { name: 'Resume actions', exact: true }),
      ).toBeFocused()
      await step(page, 'Review')
      await expect(page.locator('[data-guide-topic="review"]')).toContainText(
        'Editable copy',
      )
      await axe(page)
      await page
        .getByRole('button', { name: 'Download PDF', exact: true })
        .first()
        .click()
      const dialog = page.getByRole('dialog')
      await expect(
        dialog.getByRole('radio', { name: /For sharing/ }),
      ).toBeChecked()
      await expect(
        dialog.getByRole('radio', { name: /Editable copy/ }),
      ).not.toBeChecked()
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
      await waitForSave(page)
      await page.reload()
      await step(page, 'Experience')
      await expect(page.locator('.guide-tip:visible')).toHaveCount(0)
      await expect(page.locator('.entry-card').first()).toContainText(
        'Product designer',
      )
    })
  })
}
test('guide follows all six interface languages on narrow screens', async ({
  page,
}) => {
  test.setTimeout(60000)
  await openBlankEditor(page)
  await page.setViewportSize({ width: 320, height: 780 })
  const locales = [
    ['de', 'Hilfe zum Editor', 'Hinweise beim Bearbeiten'],
    ['es', 'Ayuda del editor', 'Consejos durante la edición'],
    ['bg', 'Помощ за редактора', 'Подсказки по време на редактиране'],
    ['uk', 'Допомога з редактором', 'Підказки під час роботи'],
    ['ru', 'Помощь по редактору', 'Подсказки по ходу работы'],
    ['en', 'Editor guide', 'Contextual editor tips'],
  ]
  for (const [locale, title, toggle] of locales) {
    await page.locator('.site-header select').selectOption(locale)
    const opener = page.locator('.guide-access button')
    await expect(opener).toHaveText(title)
    await opener.click()
    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog.getByRole('switch', { name: toggle })).toBeChecked()
    await expect(dialog.locator('summary')).toHaveCount(8)
    await dialog.locator('summary').first().click()
    await expect(dialog.locator('details[open] p')).not.toBeEmpty()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0)
    await axe(page)
    await dialog.locator('.dialog-head button').press('Escape')
    await expect(opener).toBeFocused()
  }
})
