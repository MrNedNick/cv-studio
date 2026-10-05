import { expect, it } from 'vitest'
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'
import { createDocument, emptyEntry, safeEmailUrl, safeUrl } from './model'
import {
  inspectPdfPage,
  missingPdfText,
  type PdfPageInspection,
} from './pdf-inspection'
import { resumeLinkIssues } from './resume-links'

const page = (text: string): PdfPageInspection => ({
  text,
  links: [],
  overflow: [],
})
const item = (
  str: string,
  transform = [10, 0, 0, 10, 42, 700],
  width = 100,
): TextItem => ({
  str,
  transform,
  width,
  height: 10,
  fontName: 'test',
  dir: 'ltr',
  hasEOL: true,
})
const content = (...items: TextItem[]): TextContent => ({
  items,
  styles: {
    test: { ascent: 0.8, descent: -0.2, fontFamily: 'Noto', vertical: false },
  },
  lang: 'en',
})
it('finds missing passages in the selected visible content, not hidden or untranslated drafts', () => {
  const doc = createDocument(false)
  const r = doc.versions.en
  r.basics.name = 'Someone'
  r.basics.summary = 'Missing profile\nThis line is present'
  r.work = [{ ...emptyEntry(), title: 'Hidden work' }]
  doc.hiddenSections = ['work']
  doc.versions.ru.basics.summary = 'Private Russian draft'
  r.projects = [
    { ...emptyEntry(), title: 'Missing project', url: 'not a web address' },
  ]
  r.skills = 'UX, Figma'
  expect(
    missingPdfText(doc, [page('Someone\nThis line is present\nUX · Figma')]),
  ).toEqual([
    { section: 'summary', text: 'Missing profile' },
    { section: 'projects', text: 'Missing project' },
  ])
})
it('matches page-spanning paragraphs, tracking, case, ligatures and soft hyphens', () => {
  const doc = createDocument(false)
  doc.versions.en.basics.name = 'Straße'
  doc.versions.en.basics.summary = 'Office design improved workflows'
  expect(
    missingPdfText(doc, [
      page('S T R A S S E\nOﬃce de\nsign im\n1 / 2'),
      page('proved work\u00adflows\n2 / 2'),
    ]),
  ).toEqual([])
})
it('keeps a single-page passage ending with a fraction that looks like a footer', () => {
  const doc = createDocument(false)
  doc.versions.en.basics.summary = 'Delivered milestone 1 / 1'
  expect(missingPdfText(doc, [page('Delivered milestone 1 / 1')])).toEqual([])
})
it('deduplicates repeated missing passages without hiding other sections', () => {
  const doc = createDocument(false)
  doc.versions.en.work = [
    { ...emptyEntry(), title: 'Missing title' },
    { ...emptyEntry(), title: 'Missing title' },
  ]
  doc.versions.en.projects = [{ ...emptyEntry(), title: 'Missing title' }]
  expect(missingPdfText(doc, [page('')])).toEqual([
    { section: 'work', text: 'Missing title' },
    { section: 'projects', text: 'Missing title' },
  ])
})
it('checks every paper edge using the crop box, font metrics and rotated baselines', () => {
  const result = inspectPdfPage(
    content(
      item('Inside'),
      item('Right', [10, 0, 0, 10, 580, 700]),
      item('Left', [10, 0, 0, 10, -5, 700]),
      item('Top', [10, 0, 0, 10, 42, 840]),
      item('Bottom', [10, 0, 0, 10, 42, 0]),
      item('Rotated', [0, 10, -10, 0, 42, 800]),
      item(' ', [10, 0, 0, 10, -20, -20]),
    ),
    [],
    [0, 0, 595, 842],
  )
  expect(result.overflow).toEqual(['Right', 'Left', 'Top', 'Bottom', 'Rotated'])
  expect(
    inspectPdfPage(
      content(item('Displaced', [10, 0, 0, 10, 142, 750])),
      [],
      [100, 50, 695, 892],
    ).overflow,
  ).toEqual([])
  expect(
    inspectPdfPage(
      content(item('Rounding', [10, 0, 0, 10, -0.5, 700])),
      [],
      [0, 0, 595, 842],
    ).overflow,
  ).toEqual([])
})
it('never exposes unsupported link protocols in the extracted viewer', () => {
  const result = inspectPdfPage(
    content(item('Hello')),
    [
      { subtype: 'Link', url: 'https://example.com/' },
      { subtype: 'Link', url: 'https://example.com/' },
      { subtype: 'Link', url: 'mailto:hello@example.com' },
      { subtype: 'Link', url: 'javascript:alert(1)' },
      { subtype: 'Link', url: 'data:text/html,hi' },
      { subtype: 'Link', url: 'https://user:password@example.com/' },
      { subtype: 'Link', url: 'mailto:hello@example.com\n' },
    ],
    [0, 0, 595, 842],
  )
  expect(result.links).toEqual([
    'https://example.com/',
    'mailto:hello@example.com',
  ])
})
it('identifies omitted visible links and invalid email, preserving source data', () => {
  const doc = createDocument(false)
  doc.versions.en.basics.url = 'not a web address'
  doc.versions.en.basics.email = 'without-domain'
  doc.versions.en.basics.github = 'github.com/name'
  doc.versions.en.work = [
    { ...emptyEntry(), title: 'Hidden', url: 'javascript:alert(1)' },
  ]
  doc.hiddenSections = ['work']
  doc.versions.en.projects = [
    { ...emptyEntry(), title: 'Project', url: 'ftp://example.com' },
    { ...emptyEntry(), url: 'invalid only URL' },
  ]
  doc.versions.ru.basics.url = 'Invalid other language'
  const original = structuredClone(doc)
  expect(resumeLinkIssues(doc)).toEqual([
    { section: 'basics', value: 'without-domain', kind: 'email' },
    { section: 'basics', value: 'not a web address', kind: 'web' },
    { section: 'projects', value: 'ftp://example.com', kind: 'web' },
  ])
  expect(doc).toEqual(original)
})
it('encodes email recipients without interpreting their characters as mailto options', () => {
  expect(safeEmailUrl(' alex+cv@example.com ')).toBe(
    'mailto:alex%2Bcv@example.com',
  )
  expect(safeEmailUrl('alex?subject=other@example.com')).toBe(
    'mailto:alex%3Fsubject%3Dother@example.com',
  )
  expect(safeEmailUrl('name<@example.com')).toBeUndefined()
  expect(safeEmailUrl('alex@example')).toBeUndefined()
  expect(safeUrl('https://exa\nmple.com')).toBeUndefined()
  expect(safeUrl('not a web address')).toBeUndefined()
  expect(safeUrl('https://not%20a%20web%20address/')).toBeUndefined()
  expect(safeUrl('example.com/my work')).toBe('https://example.com/my%20work')
})
