// @vitest-environment node
import { expect, it, beforeAll } from 'vitest'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  createDocument,
  parseDocument,
  templateIds,
  type Template,
  locales,
} from './model'
import { configurePdfFonts, exportPdf } from './pdf'
import {
  inspectPdfPage,
  missingPdfText,
  type PdfPageInspection,
} from './pdf-inspection'
beforeAll(() => configurePdfFonts(`${resolve('public')}/`))
it('detects text crossing a physical paper edge in an actual PDF', async () => {
  const file = await PDFDocument.create()
  const font = await file.embedFont(StandardFonts.Helvetica)
  const page = file.addPage([595, 842])
  page.drawText('Crossing the edge', { x: 590, y: 700, size: 12, font })
  const task = getDocument({
    data: await file.save(),
    standardFontDataUrl: `${resolve('node_modules/pdfjs-dist/standard_fonts')}/`,
  })
  try {
    const pdf = await task.promise
    const actual = await pdf.getPage(1)
    const inspected = inspectPdfPage(
      await actual.getTextContent(),
      [],
      actual.view,
    )
    expect(inspected.overflow.length).toBeGreaterThan(0)
    expect(inspected.overflow[0]).toBe('C')
    const doc = createDocument(false)
    doc.versions.en.basics.name = 'Crossing the edge'
    expect(missingPdfText(doc, [inspected])).toEqual([
      { section: 'basics', text: 'Crossing the edge' },
    ])
  } finally {
    await task.destroy()
  }
})
async function inspect(doc: import('./model').ResumeDocument) {
  const blob = await exportPdf(doc, { editable: false })
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  try {
    const pdf = await task.promise
    const pages: PdfPageInspection[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      pages.push(
        inspectPdfPage(
          await page.getTextContent(),
          await page.getAnnotations(),
          page.view,
        ),
      )
    }
    return { pages, missing: missingPdfText(doc, pages) }
  } finally {
    await task.destroy()
  }
}
it.each(locales)(
  'inspects the %s example without reporting missing passages or overflow',
  async (language) => {
    const result = await inspect(createDocument(true, language))
    expect(result.missing).toEqual([])
    expect(result.pages.flatMap((page) => page.overflow)).toEqual([])
  },
)
it('matches a single paragraph continued across pages, excluding fixed page numbers', async () => {
  const doc = createDocument(true)
  doc.versions.en.basics.summary = Array.from(
    { length: 120 },
    (_, i) =>
      `Outcome ${i + 1} improved product conversion by 24% and shortened support times.`,
  ).join(' ')
  const result = await inspect(doc)
  expect(result.pages.length).toBeGreaterThan(2)
  expect(result.missing).toEqual([])
  expect(result.pages.flatMap((page) => page.overflow)).toEqual([])
})
it('retains invalid email as text without creating an invalid PDF link', async () => {
  const doc = createDocument(true)
  doc.versions.en.basics.email = 'invalid-email'
  doc.versions.en.basics.url = 'javascript:alert(1)'
  const result = await inspect(doc)
  expect(result.pages.map((page) => page.text).join(' ')).toContain(
    'invalid-email',
  )
  expect(result.pages.flatMap((page) => page.links)).toEqual([])
  expect(result.missing).toEqual([])
})
it('detects unsupported characters missing from the actual text layer', async () => {
  const doc = createDocument(false)
  doc.versions.en.basics.name = 'A Reader'
  doc.versions.en.basics.summary =
    'Delivered results 🚀 with clear measurements.'
  const result = await inspect(doc)
  expect(result.missing).toEqual([
    { section: 'summary', text: doc.versions.en.basics.summary },
  ])
})
it('exports selectable Cyrillic text, links, and editable source for every template', async () => {
  for (const template of templateIds as readonly Template[]) {
    const doc = createDocument(true, 'ru')
    doc.template = template
    const blob = await exportPdf(doc),
      bytes = new Uint8Array(await blob.arrayBuffer())
    const task = getDocument({ data: bytes })
    const pdf = await task.promise
    let text = ''
    const inspected: PdfPageInspection[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      inspected.push(
        inspectPdfPage(content, await page.getAnnotations(), page.view),
      )
      text += content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    }
    expect(text).toContain('Александра Морозова')
    // Letter-spaced headings must still extract as whole words.
    expect(text).toContain('ОПЫТ РАБОТЫ')
    expect(text).toContain('Продуктовый дизайнер')
    expect(text).toContain('24%')
    expect(text).toContain('Английский')
    expect(missingPdfText(doc, inspected), template).toEqual([])
    expect(
      inspected.flatMap((page) => page.overflow),
      template,
    ).toEqual([])
    const files = (await pdf.getAttachments()) as Record<
      string,
      { content: Uint8Array }
    >
    expect(
      parseDocument(
        JSON.parse(new TextDecoder().decode(files['neatcv.json'].content)),
      ),
    ).toEqual(doc)
    const links = await (await pdf.getPage(1)).getAnnotations()
    expect(links.some((link) => link.url === 'https://example.com/')).toBe(true)
    await task.destroy()
    await writeFile(
      `/tmp/neatcv-${template}.pdf`,
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
    const inspected: PdfPageInspection[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      inspected.push(
        inspectPdfPage(content, await page.getAnnotations(), page.view),
      )
      text += content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    }
    expect(text).toContain('Достижение 85')
    expect(text).toContain('Английский')
    expect(missingPdfText(doc, inspected), template).toEqual([])
    expect(
      inspected.flatMap((page) => page.overflow),
      template,
    ).toEqual([])
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
          JSON.parse(new TextDecoder().decode(files['neatcv.json'].content)),
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
      '/tmp/neatcv-sharing.pdf',
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

it('follows a custom section order and leaves hidden sections out', async () => {
  const doc = createDocument(true, 'en')
  doc.sectionOrder = [
    'languages',
    'summary',
    'work',
    'education',
    'skills',
    'projects',
  ]
  doc.hiddenSections = ['education']
  const bytes = new Uint8Array(
    await (await exportPdf(doc, { editable: false })).arrayBuffer(),
  )
  const task = getDocument({ data: bytes })
  const content = await (await (await task.promise).getPage(1)).getTextContent()
  const text = content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
  expect(text.indexOf('LANGUAGES')).toBeGreaterThan(-1)
  expect(text.indexOf('LANGUAGES')).toBeLessThan(text.indexOf('EXPERIENCE'))
  expect(text).not.toContain('EDUCATION')
  await task.destroy()
})

const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
it.each(['modern', 'executive', 'spotlight'] as const)(
  'embeds an optional photo in the %s header and keeps it in the editable copy',
  async (template) => {
    const doc = createDocument(true, 'en')
    doc.template = template
    doc.photo = pixel
    const bytes = new Uint8Array(await (await exportPdf(doc)).arrayBuffer())
    expect(new TextDecoder('latin1').decode(bytes)).toMatch(
      /\/Subtype\s*\/Image/,
    )
    const task = getDocument({ data: bytes })
    const pdf = await task.promise
    const files = (await pdf.getAttachments()) as Record<
      string,
      { content: Uint8Array }
    >
    expect(
      parseDocument(
        JSON.parse(new TextDecoder().decode(files['neatcv.json'].content)),
      ).photo,
    ).toBe(pixel)
    const text = (await (await pdf.getPage(1)).getTextContent()).items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    expect(text).toContain('Alex Morgan')
    await task.destroy()
  },
  30000,
)

it('wraps a long skills line without stray hyphens or glued words', async () => {
  const doc = createDocument(true, 'ru')
  doc.template = 'minimal'
  doc.versions.ru.skills = Array.from(
    { length: 14 },
    (_, i) => `Юзабилити-тестирование ${i + 1}`,
  ).join(', ')
  const bytes = new Uint8Array(
    await (await exportPdf(doc, { editable: false })).arrayBuffer(),
  )
  const task = getDocument({ data: bytes })
  const items = (
    await (await (await task.promise).getPage(1)).getTextContent()
  ).items.map((item) => ('str' in item ? item.str : ''))
  const skills = items.filter((s) => s.includes('Юзабилити'))
  expect(skills.length).toBeGreaterThan(1)
  for (const line of skills) expect(line).not.toMatch(/·-|·\S|\S·\S/)
  await task.destroy()
})

it.each([
  ['de', 'BERUFSERFAHRUNG', 'Überarbeitete', 'heute'],
  ['es', 'EXPERIENCIA', 'Diseñadora de producto', 'actualidad'],
  ['bg', 'ПРОФЕСИОНАЛЕН ОПИТ', 'Преработих процеса', 'момента'],
  ['uk', 'ДОСВІД РОБОТИ', 'інтерв’ю', 'теперішній час'],
] as const)(
  'renders the %s version with localized headings, dates, and letters',
  async (lang, heading, phrase, present) => {
    const doc = createDocument(true, lang)
    doc.versions[lang].work[0].description +=
      '\nÜberarbeitete Ñandú Їжак Єва Ґанок'
    const bytes = new Uint8Array(
      await (await exportPdf(doc, { editable: false })).arrayBuffer(),
    )
    const task = getDocument({ data: bytes })
    const text = (
      await (await (await task.promise).getPage(1)).getTextContent()
    ).items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    expect(text).toContain(heading)
    expect(text).toContain(phrase)
    expect(text).toContain(present)
    for (const word of ['Überarbeitete', 'Ñandú', 'Їжак', 'Єва', 'Ґанок'])
      expect(text).toContain(word)
    await task.destroy()
  },
  30000,
)

it('writes custom PDF properties and scales text with the chosen size', async () => {
  const doc = createDocument(true, 'en')
  doc.pdf = {
    ...doc.pdf,
    title: 'Alex Morgan — Product Designer',
    author: 'A. Morgan',
  }
  const load = async (size: typeof doc.textSize) => {
    doc.textSize = size
    const bytes = new Uint8Array(
      await (await exportPdf(doc, { editable: false })).arrayBuffer(),
    )
    const task = getDocument({ data: bytes })
    const pdf = await task.promise
    const info = (await pdf.getMetadata()).info as Record<string, string>
    const page = await pdf.getPage(1)
    const item = (await page.getTextContent()).items.find(
      (i) => 'str' in i && i.str.startsWith('Redesigned checkout'),
    ) as { transform: number[] }
    const height = item.transform[0]
    await task.destroy()
    return { info, height }
  }
  const small = await load('xs'),
    large = await load('xl')
  expect(small.info.Title).toBe('Alex Morgan — Product Designer')
  expect(small.info.Author).toBe('A. Morgan')
  expect(large.height).toBeGreaterThan(small.height)
})
