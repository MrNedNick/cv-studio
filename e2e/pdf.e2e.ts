import { copyFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import {
  downloadPdf,
  openExample,
  readPdf,
  step,
  waitForSave,
} from './helpers.ts'

test('an editable PDF reopens for editing after everything is cleared', async ({
  page,
}) => {
  await openExample(page)
  await step(page, 'Personal details')
  await page
    .getByRole('textbox', { name: 'Full name', exact: true })
    .fill('Robin Roundtrip')
  await waitForSave(page)

  const download = await downloadPdf(page, 'Editable copy')
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const pdf = await readPdf(download)
  expect(pdf.text).toContain('Robin Roundtrip')
  expect(pdf.attachments).toContain('cv-studio.json')
  expect(pdf.info.Title).toBeTruthy()
  expect(pdf.info.Author).toBe('Robin Roundtrip')

  await page.getByRole('button', { name: 'Clear everything' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Start new' })
    .click()
  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('')

  // A renamed download without the extension is still recognised as a PDF.
  const renamed = pdf.path.replace(/\.pdf$/, '')
  await copyFile(pdf.path, renamed)
  await page.getByLabel('Open resume file').setInputFiles(renamed)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Open resume' })
    .click()
  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('Robin Roundtrip')

  await page
    .getByRole('textbox', { name: 'Job title or speciality', exact: true })
    .fill('Edited after reopening')
  await waitForSave(page)
  await page.reload()
  await step(page, 'Personal details')
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: true }),
  ).toHaveValue('Robin Roundtrip')
  await expect(
    page.getByRole('textbox', { name: 'Job title or speciality', exact: true }),
  ).toHaveValue('Edited after reopening')
})

test('a sharing PDF has real text, no source, and cannot be reopened', async ({
  page,
}) => {
  await openExample(page)
  const download = await downloadPdf(page, 'For sharing')
  const pdf = await readPdf(download)
  expect(pdf.text).toContain('Alex Morgan')
  expect(pdf.attachments).toEqual([])

  await page.getByLabel('Open resume file').setInputFiles(pdf.path)
  await expect(page.getByText(/Could not open this file/)).toBeVisible()
})

test('the PDF follows the selected language', async ({ page }) => {
  await openExample(page)
  const english = await readPdf(await downloadPdf(page, 'For sharing'))
  expect(english.text).toContain('Alex Morgan')
  expect(english.text).not.toContain('Александра')

  await page
    .getByRole('combobox', { name: 'Interface language' })
    .selectOption('ru')
  await page.getByRole('button', { name: 'Скачать PDF' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('radio', { name: /Для отправки/ }).check()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Скачать', exact: true }).click(),
  ])
  const russian = await readPdf(download)
  expect(russian.text).toContain('Александра Морозова')
  expect(russian.text).toMatch(/ОПЫТ РАБОТЫ|Опыт работы/)
  expect(russian.text).not.toContain('Alex Morgan')
})
