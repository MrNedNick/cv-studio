// @vitest-environment node
import { expect, it, beforeAll } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createDocument, parseDocument, type Template } from './model'
import { configurePdfFonts, exportPdf } from './pdf'
beforeAll(() => configurePdfFonts(`${resolve('public')}/`))
it('exports selectable Cyrillic text, links, and editable source for every template', async () => {
  for (const template of [
    'modern',
    'classic',
    'compact',
    'sidebar',
  ] as Template[]) {
    const doc = createDocument(true)
    doc.template = template
    const blob = await exportPdf(doc),
      bytes = new Uint8Array(await blob.arrayBuffer())
    const task = getDocument({ data: bytes })
    const pdf = await task.promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    }
    expect(text).toContain('Александра Морозова')
    expect(text).toContain('24%')
    expect(text).toContain('Английский')
    const files = (await pdf.getAttachments()) as Record<
      string,
      { content: Uint8Array }
    >
    expect(
      parseDocument(
        JSON.parse(new TextDecoder().decode(files['cv-studio.json'].content)),
      ),
    ).toEqual(doc)
    const links = await (await pdf.getPage(1)).getAnnotations()
    expect(links.some((link) => link.url === 'https://example.com/')).toBe(true)
    await task.destroy()
    await writeFile(
      `/tmp/cv-studio-${template}.pdf`,
      new Uint8Array(await blob.arrayBuffer()),
    )
  }
}, 30000)
it.each(['modern', 'classic', 'compact', 'sidebar'] as const)(
  'paginates long %s experience without losing the last achievement',
  async (template) => {
    const doc = createDocument(true)
    doc.template = template
    doc.versions.ru.work[0].description = Array.from(
      { length: 85 },
      (_, i) =>
        `Достижение ${i + 1}: улучшила конверсию продукта на 24% и сократила время обработки заявок.`,
    ).join('\n')
    const blob = await exportPdf(doc),
      bytes = new Uint8Array(await blob.arrayBuffer())
    const loaded = await PDFDocument.load(bytes)
    expect(loaded.getPageCount()).toBeGreaterThan(2)
    const task = getDocument({ data: bytes })
    const pdf = await task.promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const content = await (await pdf.getPage(i)).getTextContent()
      text += content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    }
    expect(text).toContain('Достижение 85')
    expect(text).toContain('Английский')
    await task.destroy()
  },
  30000,
)
it('exports the selected English version', async () => {
  const doc = createDocument(true)
  doc.language = 'en'
  const blob = await exportPdf(doc),
    task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }),
    pdf = await task.promise
  const content = await (await pdf.getPage(1)).getTextContent(),
    text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
  expect(text).toContain('Alex Morgan')
  expect(text).toContain('Product designer')
  expect(text).not.toContain('Александра')
  await task.destroy()
}, 30000)
it('keeps both alphabets readable in serif and mixed typography', async () => {
  for (const typography of ['serif', 'mixed'] as const) {
    for (const language of ['ru', 'en'] as const) {
      const doc = createDocument(true)
      doc.typography = typography
      doc.language = language
      const blob = await exportPdf(doc)
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const structure = await PDFDocument.load(bytes)
      expect(
        structure.context
          .enumerateIndirectObjects()
          .some(([, object]) => object.toString().includes('NotoSerif')),
      ).toBe(true)
      const task = getDocument({ data: bytes }),
        pdf = await task.promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const content = await (await pdf.getPage(i)).getTextContent()
        text += content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
      }
      expect(text).toContain(
        language === 'ru' ? 'Александра Морозова' : 'Alex Morgan',
      )
      expect(text).toContain('24%')
      expect(text).toContain(language === 'ru' ? 'Английский' : 'English')
      const files = (await pdf.getAttachments()) as Record<
        string,
        { content: Uint8Array }
      >
      expect(
        parseDocument(
          JSON.parse(new TextDecoder().decode(files['cv-studio.json'].content)),
        ).typography,
      ).toBe(typography)
      await task.destroy()
    }
  }
}, 30000)
