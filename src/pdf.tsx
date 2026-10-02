import {
  Document,
  Font,
  Link,
  Page,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { PDFDocument } from 'pdf-lib'
import {
  dateRange,
  safeUrl,
  sectionLabels,
  toJsonResume,
  visibleSections,
  type BodySection,
  type Entry,
  type StudioDocument,
} from './model'
let fontBase = import.meta.env.BASE_URL
let renderQueue: Promise<unknown> = Promise.resolve()
export function configurePdfFonts(base: string) {
  fontBase = base
}
function registerFonts() {
  Font.clear()
  Font.register({ family: 'Helvetica', src: 'Helvetica' })
  Font.register({
    family: 'Noto',
    fonts: [
      { src: `${fontBase}fonts/NotoSans-Regular.ttf` },
      { src: `${fontBase}fonts/NotoSans-Bold.ttf`, fontWeight: 700 },
    ],
  })
  Font.register({
    family: 'NotoSerif',
    fonts: [
      { src: `${fontBase}fonts/NotoSerif-Regular.ttf` },
      { src: `${fontBase}fonts/NotoSerif-Bold.ttf`, fontWeight: 700 },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
}
export function ResumePDF({ doc }: { doc: StudioDocument }) {
  const r = doc.versions[doc.language],
    labels = sectionLabels[doc.language],
    compact = doc.template === 'compact' || doc.density === 'compact',
    sidebar = doc.template === 'sidebar',
    classic = doc.template === 'classic',
    technical = doc.template === 'technical',
    executive = doc.template === 'executive',
    spotlight = doc.template === 'spotlight',
    swiss = doc.template === 'swiss',
    accent = classic ? '#252b2a' : doc.accent,
    bodyFont = doc.typography === 'serif' ? 'NotoSerif' : 'Noto',
    headingFont = doc.typography === 'sans' ? 'Noto' : 'NotoSerif'
  const heading = {
    fontFamily: headingFont,
    color: accent,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: compact ? 12 : 18,
    letterSpacing: executive ? 1.6 : 1,
    ...(executive && {
      borderBottomWidth: 0.75,
      borderBottomColor: '#cfd6d2',
      paddingBottom: 3,
    }),
  }
  // Swiss sets each heading in the left margin; the text order stays heading → content.
  const titled = (
    key: string,
    label: string,
    ahead: number,
    children: ReactNode,
  ) =>
    swiss ? (
      <View
        key={key}
        style={{ paddingLeft: 108, marginTop: compact ? 12 : 18 }}
      >
        <Text
          style={{
            ...heading,
            position: 'absolute',
            left: 0,
            top: 1,
            width: 96,
            marginTop: 0,
            fontSize: 8.5,
          }}
        >
          {label.toLocaleUpperCase(doc.language)}
        </Text>
        {children}
      </View>
    ) : (
      <View key={key}>
        <Text style={heading} minPresenceAhead={ahead}>
          {label.toLocaleUpperCase(doc.language)}
        </Text>
        {children}
      </View>
    )
  const block = (key: 'work' | 'education' | 'projects' | 'languages') =>
    r[key].filter((e) => e.title || e.subtitle || e.description).length > 0 &&
    titled(
      key,
      labels[key],
      55,
      r[key]
        .filter((e) => e.title || e.subtitle || e.description)
        .map((e: Entry) => (
          <View key={e.id} style={{ marginBottom: compact ? 9 : 13 }}>
            <View minPresenceAhead={30}>
              <View
                style={{
                  flexDirection:
                    sidebar && key === 'education' ? 'column' : 'row',
                  justifyContent: 'space-between',
                  gap: sidebar && key === 'education' ? 2 : 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: 700,
                    flex: sidebar && key === 'education' ? undefined : 1,
                  }}
                >
                  {e.title}
                </Text>
                {key !== 'languages' && (
                  <Text
                    style={{ color: '#59635f', fontSize: 8, maxWidth: 165 }}
                  >
                    {dateRange(e, doc.language)}
                  </Text>
                )}
              </View>
              {e.subtitle && (
                <Text style={{ color: '#59635f', marginTop: 2 }}>
                  {e.subtitle}
                </Text>
              )}
            </View>
            {e.description
              .split('\n')
              .filter(Boolean)
              .map((line, i) => (
                <Text
                  key={i}
                  style={{
                    marginTop: 4,
                    paddingLeft: key === 'work' ? 9 : 0,
                  }}
                >
                  {key === 'work' ? '•  ' : ''}
                  {line}
                </Text>
              ))}
            {e.url && safeUrl(e.url) && (
              <Link
                src={safeUrl(e.url)!}
                style={{ color: accent, fontSize: 9, marginTop: 4 }}
              >
                {e.url.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </View>
        )),
    )
  const skills =
    r.skills.trim() &&
    titled(
      'skills',
      labels.skills,
      30,
      <Text>
        {r.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join('  ·  ')}
      </Text>,
    )
  const summary =
    r.basics.summary.trim() &&
    titled(
      'summary',
      labels.summary,
      35,
      r.basics.summary
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line, i) => (
          <Text key={i} style={{ marginTop: i ? 4 : 0 }}>
            {line}
          </Text>
        )),
    )
  const muted = spotlight ? '#e4ece8' : '#59635f',
    order = visibleSections(doc),
    mainColumn: BodySection[] = ['summary', 'work', 'projects'],
    // Empty sections render nothing; an empty string would break the PDF tree.
    sectionBlock = (section: BodySection) =>
      (section === 'summary'
        ? summary
        : section === 'skills'
          ? skills
          : block(section)) || null
  return (
    <Document
      title={`${r.basics.name || 'Resume'} — CV`}
      author={r.basics.name}
      subject={r.basics.label}
      keywords={r.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ')}
      language={doc.language}
    >
      <Page
        size="A4"
        style={{
          fontFamily: bodyFont,
          color: '#25332e',
          fontSize: compact ? 9 : 10,
          lineHeight: 1.5,
          paddingTop: 40,
          paddingBottom: 42,
          paddingHorizontal: 42,
        }}
      >
        <View
          style={{
            borderBottomWidth:
              technical || spotlight ? 0 : classic || swiss ? 1 : 2,
            borderLeftWidth: technical ? 3 : 0,
            borderLeftColor: accent,
            paddingLeft: technical ? 14 : 0,
            borderBottomColor: swiss ? '#cfd6d2' : accent,
            paddingBottom: 18,
            ...(executive && { alignItems: 'center', textAlign: 'center' }),
            ...(spotlight && {
              backgroundColor: accent,
              marginTop: -40,
              marginHorizontal: -42,
              paddingHorizontal: 42,
              paddingTop: 36,
              paddingBottom: 24,
            }),
          }}
        >
          <Text
            style={{
              fontFamily: headingFont,
              fontSize: compact ? 25 : swiss ? 32 : executive ? 27 : 29,
              fontWeight: 700,
              color: spotlight ? '#ffffff' : accent,
              lineHeight: 1.2,
              letterSpacing: executive ? 0.6 : swiss ? -0.4 : 0,
            }}
          >
            {r.basics.name ||
              (doc.language === 'ru' ? 'Ваше имя' : 'Your name')}
          </Text>
          {r.basics.label && (
            <Text
              style={{
                fontSize: executive ? 10 : 12,
                marginTop: 7,
                color: spotlight ? '#ffffff' : undefined,
                letterSpacing: executive ? 1.8 : 0,
              }}
            >
              {executive
                ? r.basics.label.toLocaleUpperCase(doc.language)
                : r.basics.label}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 10,
              fontSize: 8,
              color: muted,
              ...(executive && { justifyContent: 'center' }),
            }}
          >
            {r.basics.location && <Text>{r.basics.location}</Text>}
            {r.basics.email && (
              <Link style={{ color: muted }} src={`mailto:${r.basics.email}`}>
                {r.basics.email}
              </Link>
            )}
            {r.basics.phone && <Text>{r.basics.phone}</Text>}
            {(['url', 'linkedin', 'github'] as const).map(
              (key) =>
                r.basics[key] &&
                safeUrl(r.basics[key]) && (
                  <Link
                    key={key}
                    style={{ color: muted }}
                    src={safeUrl(r.basics[key])!}
                  >
                    {r.basics[key].replace(/^https?:\/\//, '')}
                  </Link>
                ),
            )}
          </View>
        </View>
        {sidebar ? (
          <View style={{ flexDirection: 'row', gap: 25 }}>
            <View style={{ flex: 2 }}>
              {order
                .filter((s) => mainColumn.includes(s))
                .map((s) => sectionBlock(s))}
            </View>
            <View style={{ flex: 1 }}>
              {order
                .filter((s) => !mainColumn.includes(s))
                .map((s) => sectionBlock(s))}
            </View>
          </View>
        ) : (
          order.map((s) => sectionBlock(s))
        )}
        <Text
          fixed
          style={{
            position: 'absolute',
            bottom: 22,
            right: 42,
            color: '#68736e',
            fontSize: 8,
          }}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ''
          }
        />
      </Page>
    </Document>
  )
}
export function renderResume(doc: StudioDocument): Promise<Blob> {
  // Each render owns its font instances; shared glyph subsets corrupt later exports.
  const result = renderQueue.then(() => {
    registerFonts()
    return pdf(<ResumePDF doc={doc} />).toBlob()
  })
  renderQueue = result.catch(() => undefined)
  return result
}
export async function exportPdf(
  doc: StudioDocument,
  { editable = true }: { editable?: boolean } = {},
) {
  const raw = await renderResume(doc)
  if (!editable) return raw
  const result = await PDFDocument.load(await raw.arrayBuffer())
  await result.attach(
    new TextEncoder().encode(JSON.stringify(toJsonResume(doc))),
    'cv-studio.json',
    {
      mimeType: 'application/json',
      description: 'Editable resume source for CV Studio',
    },
  )
  return new Blob([new Uint8Array(await result.save())], {
    type: 'application/pdf',
  })
}
