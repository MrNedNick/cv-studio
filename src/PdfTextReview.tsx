import { useEffect, useState } from 'react'
import { LoaderCircle, RotateCcw } from 'lucide-react'
import {
  sectionLabels,
  type Locale,
  type ResumeDocument,
  type Section,
} from './model'
import { translator } from './i18n'
import {
  inspectPdfPage,
  missingPdfText,
  type PdfPageInspection,
} from './pdf-inspection'
import PdfLinkWarnings from './PdfLinkWarnings'
import { Disclosure } from './motion'
import './PdfTextReview.css'

export default function PdfTextReview({
  doc,
  locale,
  goSection,
}: {
  doc: ResumeDocument
  locale: Locale
  goSection?: (section: Section) => void
}) {
  const t = translator(locale)
  const [result, setResult] = useState<PdfPageInspection[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    let task: ReturnType<typeof import('./pdf-reader').getDocument> | undefined
    setResult(null)
    setFailed(false)
    const timer = setTimeout(async () => {
      try {
        const [{ renderResume }, { getDocument }] = await Promise.all([
          import('./pdf'),
          import('./pdf-reader'),
        ])
        if (!active) return
        const blob = await renderResume(doc)
        if (!active) return
        const data = await blob.arrayBuffer()
        if (!active) return
        task = getDocument({ data })
        const pdf = await task.promise
        const pages: PdfPageInspection[] = []
        for (let i = 1; i <= pdf.numPages && active; i++) {
          const page = await pdf.getPage(i)
          const [content, annotations] = await Promise.all([
            page.getTextContent(),
            page.getAnnotations(),
          ])
          pages.push(inspectPdfPage(content, annotations, page.view))
          page.cleanup()
        }
        if (active) setResult(pages)
      } catch {
        if (active) setFailed(true)
      } finally {
        await task?.destroy()
      }
    }, 180)
    return () => {
      active = false
      clearTimeout(timer)
      void task?.destroy()
    }
  }, [doc, retry])
  const missing = result ? missingPdfText(doc, result) : []
  return (
    <section
      className="pdf-text-review"
      aria-label={t('Текст из PDF', 'Text extracted from PDF')}
      aria-busy={!result && !failed}
    >
      <h2>{t('Текст из PDF', 'Text extracted from PDF')}</h2>
      <p>
        {t(
          'Проверьте порядок чтения и ссылки в самом PDF. Всё обрабатывается в браузере.',
          'Check the reading order and links in the actual PDF. Everything runs in your browser.',
        )}
      </p>
      <div role="status">
        {!result && !failed && (
          <p>
            <LoaderCircle className="spin" size={14} aria-hidden="true" />{' '}
            {t('Проверяем текст PDF…', 'Checking PDF text…')}
          </p>
        )}
        {failed && (
          <p>
            {t(
              'Не удалось прочитать текст PDF. Повторите проверку.',
              'Could not read the PDF text. Try again.',
            )}
          </p>
        )}
        {result && (
          <p>
            {t('Страниц: {pages} · A4', 'Pages: {pages} · A4', {
              pages: result.length,
            })}
          </p>
        )}
      </div>
      {failed && (
        <button
          className="button secondary"
          onClick={() => setRetry((n) => n + 1)}
        >
          <RotateCcw size={15} aria-hidden="true" />
          {t('Повторить загрузку', 'Retry preview')}
        </button>
      )}
      <PdfLinkWarnings doc={doc} locale={locale} goSection={goSection} />
      {result &&
      (missing.length || result.some((page) => page.overflow.length)) ? (
        <section className="pdf-check-findings">
          <h3>{t('Текст, который стоит проверить', 'Text to check')}</h3>
          {missing.length > 0 && (
            <>
              <p>
                {t(
                  'Эти фрагменты не найдены в извлечённом тексте PDF. Проверьте их во вкладке PDF или измените раздел.',
                  'These passages were not found in the extracted PDF text. Check them in the PDF tab or edit the section.',
                )}
              </p>
              <Disclosure
                summary={t(
                  'Не найдено фрагментов: {count}',
                  'Passages not found: {count}',
                  { count: missing.length },
                )}
                defaultOpen
              >
                <ul>
                  {missing.map((item, i) => (
                    <li key={i}>
                      <strong>{sectionLabels[locale][item.section]}</strong>
                      <span className="pdf-check-excerpt">
                        {Array.from(item.text).slice(0, 180).join('')}
                        {item.text.length > 180 ? '…' : ''}
                      </span>
                      {goSection && (
                        <button
                          className="text-button"
                          onClick={() => goSection(item.section)}
                        >
                          {t(
                            'Исправить в разделе «{section}»',
                            'Edit {section}',
                            { section: sectionLabels[locale][item.section] },
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </Disclosure>
            </>
          )}
          {result.map(
            (page, i) =>
              page.overflow.length > 0 && (
                <div key={i}>
                  <p>
                    {t(
                      'Страница {page}: текст может выходить за край листа. Попробуйте меньший размер текста или другой шаблон и проверьте вкладку PDF.',
                      'Page {page}: text may extend past the paper edge. Try a smaller text size or another template and check the PDF tab.',
                      { page: i + 1 },
                    )}
                  </p>
                  <Disclosure
                    summary={t(
                      'Фрагментов у края: {count}',
                      'Passages at the edge: {count}',
                      { count: page.overflow.length },
                    )}
                  >
                    <ul>
                      {page.overflow.map((text, j) => (
                        <li key={j} className="pdf-check-excerpt">
                          {Array.from(text).slice(0, 180).join('')}
                          {text.length > 180 ? '…' : ''}
                        </li>
                      ))}
                    </ul>
                  </Disclosure>
                </div>
              ),
          )}
        </section>
      ) : (
        result && (
          <p>
            {t(
              'Пропавших фрагментов и текста за краями листа не обнаружено.',
              'No missing passages or text outside the paper edges found.',
            )}
          </p>
        )
      )}
      {result && result.length > 2 && (
        <p className="inline-tip">
          {t(
            'Получилось больше двух страниц. Попробуйте компактный шаблон или сократите описание опыта.',
            'More than two pages. Try the compact template or shorten older experience.',
          )}
        </p>
      )}
      {result?.map((page, i) => (
        <section key={i} className="pdf-text-page">
          <h3>
            {t('Страница', 'Page')} {i + 1}
          </h3>
          {page.text ? (
            <pre lang={doc.language}>{page.text}</pre>
          ) : (
            <p className="inline-tip">
              {t(
                'На этой странице нет извлекаемого текста. Проверьте её во вкладке PDF.',
                'This page has no extractable text. Check it in the PDF tab.',
              )}
            </p>
          )}
          <h4>{t('Ссылки в PDF', 'Links in PDF')}</h4>
          {page.links.length ? (
            <ul>
              {page.links.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('На этой странице нет ссылок.', 'No links on this page.')}</p>
          )}
        </section>
      ))}
    </section>
  )
}
