import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { PDFDocument } from 'pdf-lib'
import { translate } from './i18n'
import {
  dateRange,
  safeUrl,
  sectionLabels,
  toJsonResume,
  visibleSections,
  pdfMetadata,
  textSizePoints,
  type BodySection,
  type Entry,
  type StudioDocument,
} from './model'
let fontBase = import.meta.env.BASE_URL
/** Text colours on white paper or on the accent band; a test keeps them ≥ 4.5:1. */
export const pdfColors = {
  text: '#25332e',
  ink: '#18201d',
  muted: '#59635f',
  quiet: '#5e6863',
  pageNumber: '#68736e',
  onAccent: '#ffffff',
  onAccentMuted: '#e4ece8',
}
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
// Text extractors split words into letters once tracking exceeds about 0.1em,
// which is what applicant tracking systems read. Keep it below that.
const track = (fontSize: number, value: number) =>
  Math.min(value, fontSize * 0.08)
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
    timeline = doc.template === 'timeline',
    minimal = doc.template === 'minimal',
    bold = doc.template === 'bold',
    ivy = doc.template === 'ivy',
    centered = executive || ivy,
    accent = classic ? '#252b2a' : doc.accent,
    bodyFont = doc.typography === 'serif' ? 'NotoSerif' : 'Noto',
    headingFont = doc.typography === 'sans' && !ivy ? 'Noto' : 'NotoSerif'
  const meta = pdfMetadata(doc),
    base =
      textSizePoints[doc.textSize] - (doc.template === 'compact' ? 0.5 : 0),
    // Secondary sizes follow the body size so every text size stays balanced.
    scale = base / 10
  const heading = {
    fontFamily: headingFont,
    color: accent,
    fontSize: 10 * scale,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: compact ? 12 : 18,
    letterSpacing: executive || ivy ? 1.8 : 1,
    ...(executive && {
      borderBottomWidth: 0.75,
      borderBottomColor: '#cfd6d2',
      paddingBottom: 3,
    }),
    ...(minimal && {
      color: pdfColors.quiet,
      fontSize: 8.5,
      letterSpacing: 2.2,
    }),
    ...(bold && {
      backgroundColor: accent,
      color: pdfColors.onAccent,
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      alignSelf: 'flex-start' as const,
      letterSpacing: 1.4,
    }),
  }
  heading.letterSpacing = track(heading.fontSize, heading.letterSpacing)
  const rule = { flex: 1, height: 0.75, backgroundColor: '#cfd6d2' }
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
            letterSpacing: track(8.5, heading.letterSpacing),
          }}
        >
          {label.toLocaleUpperCase(doc.language)}
        </Text>
        {children}
      </View>
    ) : ivy ? (
      <View key={key}>
        <View
          minPresenceAhead={ahead}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: compact ? 12 : 18,
            marginBottom: 8,
          }}
        >
          <View style={rule} />
          <Text style={{ ...heading, marginTop: 0, marginBottom: 0 }}>
            {label.toLocaleUpperCase(doc.language)}
          </Text>
          <View style={rule} />
        </View>
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
        .map((e: Entry) => {
          const content = (
            <View style={timeline ? { flex: 1 } : undefined}>
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
                  {key !== 'languages' && !timeline && (
                    <Text
                      style={{
                        color: pdfColors.muted,
                        fontSize: 8 * scale,
                        maxWidth: 165,
                      }}
                    >
                      {dateRange(e, doc.language)}
                    </Text>
                  )}
                </View>
                {e.subtitle && (
                  <Text style={{ color: pdfColors.muted, marginTop: 2 }}>
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
                  style={{ color: accent, fontSize: 9 * scale, marginTop: 4 }}
                >
                  {e.url.replace(/^https?:\/\//, '')}
                </Link>
              )}
            </View>
          )
          return (
            <View
              key={e.id}
              style={{
                marginBottom: compact ? 9 : 13,
                ...(timeline && { flexDirection: 'row' as const, gap: 14 }),
              }}
            >
              {timeline && (
                <Text
                  style={{
                    width: 78,
                    paddingTop: 1.5,
                    color: pdfColors.muted,
                    fontSize: 8,
                  }}
                >
                  {key === 'languages' ? '' : dateRange(e, doc.language)}
                </Text>
              )}
              {content}
            </View>
          )
        }),
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
          .join(' · ')}
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
  const photo = doc.photo,
    portrait = (
      <Image
        src={photo}
        style={{
          width: 64,
          height: 80,
          borderRadius: 6,
          objectFit: 'cover',
          ...(centered && { marginBottom: 12 }),
        }}
      />
    )
  const muted = spotlight ? pdfColors.onAccentMuted : pdfColors.muted,
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
      title={meta.title}
      author={meta.author}
      subject={meta.subject}
      keywords={meta.keywords}
      language={doc.language}
    >
      <Page
        size="A4"
        style={{
          fontFamily: bodyFont,
          color: pdfColors.text,
          fontSize: base,
          lineHeight: 1.5,
          paddingTop: 40,
          paddingBottom: 42,
          paddingHorizontal: 42,
        }}
      >
        <View
          style={{
            borderBottomWidth:
              technical || spotlight || minimal
                ? 0
                : bold
                  ? 4
                  : classic || swiss || ivy
                    ? 1
                    : 2,
            borderLeftWidth: technical ? 3 : 0,
            borderLeftColor: accent,
            paddingLeft: technical ? 14 : 0,
            borderBottomColor: swiss || ivy ? '#cfd6d2' : accent,
            paddingBottom: minimal ? 6 : 18,
            ...(photo && !centered
              ? { flexDirection: 'row', alignItems: 'center', gap: 18 }
              : {}),
            ...(centered && { alignItems: 'center', textAlign: 'center' }),
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
          {photo && centered && portrait}
          <View style={photo && !centered ? { flex: 1 } : undefined}>
            <Text
              style={{
                fontFamily: headingFont,
                fontSize: compact
                  ? 25
                  : bold
                    ? 38
                    : swiss
                      ? 32
                      : executive
                        ? 27
                        : ivy || minimal
                          ? 24
                          : 29,
                fontWeight: minimal ? 400 : 700,
                color: spotlight
                  ? pdfColors.onAccent
                  : bold || minimal
                    ? pdfColors.ink
                    : accent,
                lineHeight: 1.2,
                // Wide tracking on a name breaks text extraction into letters.
                letterSpacing: ivy
                  ? 0.4
                  : executive
                    ? 0.6
                    : swiss
                      ? -0.4
                      : bold
                        ? -1
                        : 0,
              }}
            >
              {r.basics.name ||
                translate(doc.language, 'Ваше имя', 'Your name')}
            </Text>
            {r.basics.label && (
              <Text
                style={{
                  fontSize: executive || ivy ? 10 : bold ? 13 : 12,
                  marginTop: 7,
                  color: spotlight
                    ? pdfColors.onAccent
                    : bold
                      ? accent
                      : undefined,
                  fontWeight: bold ? 700 : 400,
                  letterSpacing: executive || ivy ? track(10, 1.8) : 0,
                }}
              >
                {executive || ivy
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
                fontSize: 8 * scale,
                color: muted,
                ...(centered && { justifyContent: 'center' }),
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
          {photo && !centered && portrait}
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
            color: pdfColors.pageNumber,
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
      description: 'Editable resume source for NeatCV',
    },
  )
  return new Blob([new Uint8Array(await result.save())], {
    type: 'application/pdf',
  })
}
