import {
  Document,
  Font,
  Link,
  Page,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import {
  dateRange,
  safeUrl,
  sectionLabels,
  toJsonResume,
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
    letterSpacing: 1,
  }
  const block = (key: 'work' | 'education' | 'projects' | 'languages') =>
    r[key].filter((e) => e.title || e.subtitle || e.description).length > 0 && (
      <View key={key}>
        <Text style={heading} minPresenceAhead={55}>
          {labels[key].toLocaleUpperCase(doc.language)}
        </Text>
        {r[key]
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
          ))}
      </View>
    )
  const skills = r.skills.trim() && (
    <View>
      <Text style={heading} minPresenceAhead={30}>
        {labels.skills.toLocaleUpperCase(doc.language)}
      </Text>
      <Text>
        {r.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join('  ·  ')}
      </Text>
    </View>
  )
  const summary = r.basics.summary.trim() && (
    <View>
      <Text style={heading} minPresenceAhead={35}>
        {labels.summary.toLocaleUpperCase(doc.language)}
      </Text>
      <Text>{r.basics.summary}</Text>
    </View>
  )
  return (
    <Document
      title={`${r.basics.name || 'Resume'} — CV`}
      author={r.basics.name}
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
            borderBottomWidth: classic ? 1 : 2,
            borderBottomColor: accent,
            paddingBottom: 18,
          }}
        >
          <Text
            style={{
              fontFamily: headingFont,
              fontSize: compact ? 25 : 29,
              fontWeight: 700,
              color: accent,
              lineHeight: 1.2,
            }}
          >
            {r.basics.name ||
              (doc.language === 'ru' ? 'Ваше имя' : 'Your name')}
          </Text>
          {r.basics.label && (
            <Text style={{ fontSize: 12, marginTop: 7 }}>{r.basics.label}</Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 10,
              fontSize: 8,
              color: '#59635f',
            }}
          >
            {r.basics.location && <Text>{r.basics.location}</Text>}
            {r.basics.email && (
              <Link
                style={{ color: '#59635f' }}
                src={`mailto:${r.basics.email}`}
              >
                {r.basics.email}
              </Link>
            )}
            {r.basics.phone && <Text>{r.basics.phone}</Text>}
            {r.basics.url && safeUrl(r.basics.url) && (
              <Link style={{ color: '#59635f' }} src={safeUrl(r.basics.url)!}>
                {r.basics.url.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </View>
        </View>
        {sidebar ? (
          <View style={{ flexDirection: 'row', gap: 25 }}>
            <View style={{ flex: 2 }}>
              {summary}
              {block('work')}
              {block('projects')}
            </View>
            <View style={{ flex: 1 }}>
              {skills}
              {block('education')}
              {block('languages')}
            </View>
          </View>
        ) : (
          <>
            {summary}
            {block('work')}
            {block('education')}
            {skills}
            {block('projects')}
            {block('languages')}
          </>
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
export async function exportPdf(doc: StudioDocument) {
  const raw = await renderResume(doc),
    result = await PDFDocument.load(await raw.arrayBuffer())
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
