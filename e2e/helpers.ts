import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, type Download, type Page } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

export async function openBlankEditor(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Create your resume' }).click()
  await expect(page.getByRole('heading', { name: 'Template' })).toBeVisible()
}

export async function openExample(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Try an example' }).click()
  await expect(page.getByRole('heading', { name: 'Template' })).toBeVisible()
}

export function step(page: Page, name: string | RegExp) {
  return page
    .getByRole('navigation', { name: 'Resume steps' })
    .getByRole('button', { name })
    .first()
    .click()
}

export async function waitForSave(page: Page) {
  // Edits are saved after a short delay; the label from the previous save
  // is still on screen until then.
  await page.waitForTimeout(400)
  await expect(page.getByText('Saved in this browser')).toBeVisible()
}

/** Opens the download dialog, picks the PDF kind and returns the saved file. */
export async function downloadPdf(
  page: Page,
  kind: 'For sharing' | 'Editable copy',
) {
  await page.getByRole('button', { name: 'Download PDF' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('radio', { name: new RegExp(kind) }).check()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download', exact: true }).click(),
  ])
  return download
}

export async function readPdf(download: Download) {
  // Keep the real file name: imports and viewers see what a user would.
  const path = join(
    await mkdtemp(join(tmpdir(), 'neatcv-')),
    download.suggestedFilename(),
  )
  await download.saveAs(path)
  const bytes = new Uint8Array(await readFile(path))
  const pdf = await getDocument({ data: bytes.slice() }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent()
    text +=
      content.items.map((item) => ('str' in item ? item.str : '')).join(' ') +
      '\n'
  }
  const attachments = Object.keys((await pdf.getAttachments()) ?? {})
  const info = (await pdf.getMetadata()).info as unknown as Record<
    string,
    unknown
  >
  await pdf.destroy()
  return { path, text, attachments, info, pages: pdf.numPages }
}
