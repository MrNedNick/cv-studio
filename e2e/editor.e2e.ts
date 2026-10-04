import { expect, test } from '@playwright/test'
import { openBlankEditor, openExample, step, waitForSave } from './helpers.ts'

test('a resume filled from scratch survives a reload', async ({ page }) => {
  await openBlankEditor(page)

  await step(page, 'Personal details')
  await page
    .getByRole('textbox', { name: 'Full name', exact: true })
    .fill('Robin Hart')
  await page
    .getByRole('textbox', { name: 'Job title or speciality', exact: true })
    .fill('Frontend engineer')
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill('robin@example.com')
  await page
    .getByRole('textbox', { name: 'City and country', exact: true })
    .fill('Berlin, Germany')

  await step(page, 'Profile')
  await page
    .getByLabel('Your professional profile')
    .fill(
      'Frontend engineer who ships accessible interfaces for SaaS products.',
    )

  // Entry sections open with one empty entry ready to fill.
  await step(page, 'Experience')
  await page
    .getByRole('textbox', { name: 'Job title', exact: true })
    .fill('Senior frontend engineer')
  await page
    .getByRole('textbox', { name: 'Company', exact: true })
    .fill('Nordlicht Digital')
  await page.getByLabel('Start date').fill('2022-03')
  // Let the control scroll into view above the sticky footer before clicking.
  await page.getByRole('switch', { name: 'Present' }).check()
  await page
    .getByLabel('Achievements and impact')
    .fill('Cut build time by 40% by moving to Vite\nLed a team of 4 engineers')

  await step(page, 'Education')
  await page
    .getByRole('textbox', { name: 'Degree / field of study', exact: true })
    .fill('BSc Computer Science')
  await page
    .getByRole('textbox', { name: 'Institution', exact: true })
    .fill('TU Berlin')

  await step(page, 'Skills')
  // A comma or Enter turns typed text into skill chips.
  await page.getByLabel('Your skills').fill('React, TypeScript,')
  await page.getByLabel('Your skills').fill('Accessibility')
  await page.getByLabel('Your skills').press('Enter')

  await step(page, 'Projects')
  await page
    .getByRole('textbox', { name: 'Project name', exact: true })
    .fill('NeatCV')

  await step(page, 'Languages')
  await page.getByLabel('Language', { exact: true }).selectOption('de')
  await page.getByRole('button', { name: 'C1', exact: true }).click()

  await waitForSave(page)
  await page.reload()

  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('Robin Hart')
  await expect(
    page.getByRole('textbox', { name: 'Email', exact: true }),
  ).toHaveValue('robin@example.com')
  await step(page, 'Profile')
  await expect(page.getByLabel('Your professional profile')).toHaveValue(
    /accessible interfaces/,
  )
  await step(page, 'Experience')
  await expect(
    page.getByRole('textbox', { name: 'Job title', exact: true }),
  ).toHaveValue('Senior frontend engineer')
  await expect(page.getByRole('switch', { name: 'Present' })).toBeChecked()
  await expect(page.getByLabel('Achievements and impact')).toHaveValue(
    /Led a team of 4/,
  )
  await step(page, 'Education')
  await expect(
    page.getByRole('textbox', { name: 'Institution', exact: true }),
  ).toHaveValue('TU Berlin')
  await step(page, 'Skills')
  await expect(
    page.getByRole('list', { name: 'Added skills' }).getByRole('listitem'),
  ).toHaveText(['React', 'TypeScript', 'Accessibility'])
  await step(page, 'Projects')
  await expect(
    page.getByRole('textbox', { name: 'Project name', exact: true }),
  ).toHaveValue('NeatCV')
  await step(page, 'Languages')
  await expect(page.getByLabel('Language', { exact: true })).toHaveValue('de')
  await expect(
    page.getByRole('textbox', { name: 'Level in your own words' }),
  ).toHaveValue('C1 — advanced')

  // The text view is built from the same document as the PDF.
  const preview = page.getByRole('button', { name: 'Preview', exact: true })
  if (await preview.isVisible()) await preview.click()
  await page.getByRole('button', { name: 'Text', exact: true }).click()
  await expect(page.getByText('Senior frontend engineer').last()).toBeVisible()
})

test('undo and redo restore edits, also after a reload', async ({ page }) => {
  await openBlankEditor(page)
  await step(page, 'Personal details')
  const name = page.getByRole('textbox', { name: 'Full name', exact: true })
  await name.fill('First name')
  await name.blur()
  await page.waitForTimeout(800)
  await name.fill('Second name')
  await name.blur()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(name).toHaveValue('First name')
  await page.getByRole('button', { name: 'Redo' }).click()
  await expect(name).toHaveValue('Second name')
  await waitForSave(page)
  await page.reload()
  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('Second name')
})

test('one resume switches between every template without losing data', async ({
  page,
}) => {
  await openBlankEditor(page)
  await step(page, 'Personal details')
  await page
    .getByRole('textbox', { name: 'Full name', exact: true })
    .fill('Template Tester')
  await step(page, 'Template')
  const options = page.locator('.design-options > button')
  const count = await options.count()
  expect(count).toBe(12)
  for (let i = 0; i < count; i++) {
    await options.nth(i).click()
    await expect(options.nth(i)).toHaveAttribute('aria-pressed', 'true')
  }
  await expect(page.getByRole('img', { name: 'Resume, page 1' })).toBeVisible()
  const preview = page.getByRole('button', { name: 'Preview', exact: true })
  if (await preview.isVisible()) await preview.click()
  await page.getByRole('button', { name: 'Text', exact: true }).click()
  await expect(page.getByText('Template Tester').last()).toBeVisible()
  await page.reload()
  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('Template Tester')
})

test.describe('on a 360 px phone', () => {
  test.use({ viewport: { width: 360, height: 740 } })

  test('switches between the form and the page without horizontal scroll', async ({
    page,
  }) => {
    await openExample(page)
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
    expect(await overflow()).toBeLessThanOrEqual(0)
    await page.getByRole('button', { name: 'Preview', exact: true }).click()
    await expect(
      page.getByRole('img', { name: 'Resume, page 1' }),
    ).toBeVisible()
    expect(await overflow()).toBeLessThanOrEqual(0)
    await page.getByRole('button', { name: 'Editor', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Template' })).toBeVisible()
  })
})

test('an enlarged page fills the preview and can be dragged around', async ({
  page,
}) => {
  await openExample(page)
  await expect(page.getByRole('img', { name: 'Resume, page 1' })).toBeVisible()
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Zoom in' }).click()
  const scroller = page.getByRole('region', { name: /drag or scroll/ })
  const size = () =>
    scroller.evaluate((el) => ({
      view: el.clientWidth,
      page: el.querySelector('.pdf-pages')!.getBoundingClientRect().width,
      left: el.scrollLeft,
      top: el.scrollTop,
    }))
  const before = await size()
  // Wider than the old 680 px frame and than the visible area.
  expect(before.page).toBeGreaterThan(Math.max(680, before.view))
  const box = (await scroller.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box.x + box.width / 2 - 150,
    box.y + box.height / 2 - 120,
    {
      steps: 6,
    },
  )
  await page.mouse.up()
  const after = await size()
  expect(after.left).toBeGreaterThan(before.left + 100)
  expect(after.top).toBeGreaterThan(before.top + 80)
})
