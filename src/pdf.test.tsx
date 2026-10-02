// @vitest-environment node
import { expect, it, beforeAll } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  createDocument,
  parseDocument,
  templateIds,
  type Template,
} from './model'
import { configurePdfFonts, exportPdf } from './pdf'
beforeAll(() => configurePdfFonts(`${resolve('public')}/`))
it('exports selectable Cyrillic text, links, and editable source for every template', async () => {
  for (const template of templateIds as readonly Template[]) {
    const doc = createDocument(true, 'ru')
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
it.each(templateIds)(
  'paginates long %s experience without losing the last achievement',
  async (template) => {
    const doc = createDocument(true, 'ru')
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
  const doc = createDocument(true, 'ru')
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
      const doc = createDocument(true, 'ru')
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

it('keeps education dates below the title in the Editorial sidebar', async () => {
  const doc = createDocument(true, 'ru')
  doc.language = 'en'
  doc.template = 'sidebar'
  doc.versions.en.education[0].title = 'Design degree'
  const blob = await exportPdf(doc)
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  try {
    const pdf = await task.promise
    const content = await (await pdf.getPage(1)).getTextContent()
    const text = content.items.filter((item) => 'str' in item)
    const title = text.find((item) => item.str === 'Design degree')!
    const dates = text.find((item) => item.str.includes('2016'))!
    expect(title).toBeDefined()
    expect(dates).toBeDefined()
    expect(title.transform[5] - dates.transform[5]).toBeGreaterThan(8)
  } finally {
    await task.destroy()
  }
})

it('exports a sharing copy with only the selected language and no editable source', async () => {
  const doc = createDocument(true, 'ru')
  doc.versions.en.basics.name = 'Private English draft'
  const blob = await exportPdf(doc, { editable: false })
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  try {
    const pdf = await task.promise
    expect(await pdf.getAttachments()).toBeNull()
    const content = await (await pdf.getPage(1)).getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    expect(text).toContain('Александра Морозова')
    expect(text).not.toContain('Private English draft')
    const links = await (await pdf.getPage(1)).getAnnotations()
    expect(links.some((link) => link.url === 'https://example.com/')).toBe(true)
    await writeFile(
      '/tmp/cv-studio-sharing.pdf',
      new Uint8Array(await blob.arrayBuffer()),
    )
  } finally {
    await task.destroy()
  }
})

it('exports visible skills as metadata and keeps profile links and Technical reading order', async () => {
  const doc = createDocument(true)
  doc.template = 'technical'
  doc.versions.en.basics.linkedin = 'https://linkedin.com/in/example'
  doc.versions.en.basics.github = 'https://github.com/example'
  const bytes = new Uint8Array(
    await (await exportPdf(doc, { editable: false })).arrayBuffer(),
  )
  const metadata = await PDFDocument.load(bytes)
  expect(metadata.getAuthor()).toBe('Alex Morgan')
  expect(metadata.getSubject()).toBe('Product designer')
  expect(metadata.getKeywords()).toBe(doc.versions.en.skills)
  const task = getDocument({ data: bytes })
  try {
    const pdf = await task.promise
    const page = await pdf.getPage(1)
    const text = (await page.getTextContent()).items
      .map((i) => ('str' in i ? i.str : ''))
      .join(' ')
    expect(text.indexOf('SKILLS')).toBeLessThan(text.indexOf('EXPERIENCE'))
    expect(text).toContain('github.com/example')
    const annotations = await page.getAnnotations()
    expect(
      annotations.some((a) => a.url === 'https://github.com/example'),
    ).toBe(true)
    expect(
      annotations.some((a) => a.url === 'https://linkedin.com/in/example'),
    ).toBe(true)
    expect(await pdf.getAttachments()).toBeNull()
  } finally {
    await task.destroy()
  }
})

it('paginates a multiline profile without breaking fonts on later pages', async () => {
  const doc = createDocument(true)
  doc.template = 'technical'
  doc.versions.en.basics.summary = Array.from(
    { length: 65 },
    (_, i) =>
      `Example ${i + 1}: designed accessible interfaces and improved the checkout experience.`,
  ).join('\n')
  const bytes = new Uint8Array(
    await (await exportPdf(doc, { editable: false })).arrayBuffer(),
  )
  const task = getDocument({ data: bytes })
  try {
    const pdf = await task.promise
    expect(pdf.numPages).toBeGreaterThan(1)
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++)
      text += (await (await pdf.getPage(i)).getTextContent()).items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    expect(text).toContain('Example 65')
    expect(text).toContain('English')
  } finally {
    await task.destroy()
  }
})
