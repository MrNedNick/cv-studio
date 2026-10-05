import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'
import {
  dateRange,
  safeUrl,
  visibleSections,
  type ResumeDocument,
  type Section,
} from './model'

export type PdfPageInspection = {
  text: string
  links: string[]
  overflow: string[]
}
export type MissingPdfText = { section: Section; text: string }

// Compare writing, not layout: line breaks, tracking, ligatures and case can
// differ between source fields and extracted PDF text.
function normalize(text: string) {
  return text
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[\s\u00ad\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]+/gu, '')
}

export function missingPdfText(
  doc: ResumeDocument,
  pages: PdfPageInspection[],
) {
  const r = doc.versions[doc.language]
  const expected: MissingPdfText[] = []
  const add = (section: Section, value: string) => {
    for (const text of value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean))
      expected.push({ section, text })
  }
  for (const key of ['name', 'label', 'location', 'email', 'phone'] as const)
    add('basics', r.basics[key])
  for (const key of ['url', 'linkedin', 'github'] as const)
    if (safeUrl(r.basics[key]))
      add('basics', r.basics[key].replace(/^https?:\/\//, ''))
  for (const section of visibleSections(doc)) {
    if (section === 'summary') add(section, r.basics.summary)
    else if (section === 'skills')
      r.skills.split(',').forEach((skill) => add(section, skill))
    else
      for (const entry of r[section]) {
        if (!entry.title && !entry.subtitle && !entry.description) continue
        add(section, entry.title)
        add(section, entry.subtitle)
        add(section, entry.description)
        if (section !== 'languages')
          add(section, dateRange(entry, doc.language))
        if (safeUrl(entry.url))
          add(section, entry.url.replace(/^https?:\/\//, ''))
      }
  }
  const extracted = normalize(
    pages
      .map((page, i) =>
        // The fixed footer sits between pieces of a paragraph split across pages.
        pages.length > 1
          ? page.text.replace(
              new RegExp(`\\s${i + 1}\\s*/\\s*${pages.length}\\s*$`),
              '',
            )
          : page.text,
      )
      .join('\n'),
  )
  const seen = new Set<string>()
  return expected.filter(({ section, text }) => {
    const key = `${section}:${normalize(text)}`
    if (seen.has(key) || extracted.includes(normalize(text))) return false
    seen.add(key)
    return true
  })
}

function outsidePage(item: TextItem, content: TextContent, view: number[]) {
  const [a, b, c, d, x, y] = item.transform as number[]
  const style = content.styles[item.fontName]
  if (!style || style.vertical) return false
  const baseline = Math.hypot(a, b)
  if (!baseline || ![a, b, c, d, x, y, item.width].every(Number.isFinite))
    return false
  const ascent = style.ascent ?? 0.8
  const descent = style.descent ?? -0.2
  const dx = (a / baseline) * item.width
  const dy = (b / baseline) * item.width
  // PDF coordinates, including a displaced crop box and rotated text. Font
  // metrics are approximate; allow a point for rounding at the paper edge.
  return [ascent, descent].some((height) =>
    [0, 1].some((end) => {
      const px = x + c * height + dx * end
      const py = y + d * height + dy * end
      return (
        px < view[0] - 1 ||
        py < view[1] - 1 ||
        px > view[2] + 1 ||
        py > view[3] + 1
      )
    }),
  )
}

export function inspectPdfPage(
  content: TextContent,
  annotations: { subtype?: string; url?: unknown }[],
  view: number[],
): PdfPageInspection {
  let text = ''
  const overflow = new Set<string>()
  for (const item of content.items) {
    if (!('str' in item)) continue
    text += item.str + (item.hasEOL ? '\n' : ' ')
    if (item.str.trim() && outsidePage(item, content, view))
      overflow.add(item.str.trim())
  }
  const links = [
    ...new Set(
      annotations.flatMap((a) => {
        if (a.subtype !== 'Link' || typeof a.url !== 'string') return []
        const href =
          safeUrl(a.url) ??
          (/^(mailto|tel):[^\s<>]+$/i.test(a.url) ? a.url : undefined)
        return href ? [href] : []
      }),
    ),
  ]
  return {
    text: text.trim().replace(/\u0000/g, '�'),
    links,
    overflow: [...overflow],
  }
}
