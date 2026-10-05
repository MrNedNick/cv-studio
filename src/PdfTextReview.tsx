import { useEffect, useState } from 'react'
import { LoaderCircle, RotateCcw } from 'lucide-react'
import { safeUrl, type Locale, type ResumeDocument } from './model'
import { translator } from './i18n'
import './PdfTextReview.css'

type PdfPage = { text: string; links: string[] }
export default function PdfTextReview({
  doc,
  locale,
}: {
  doc: ResumeDocument
  locale: Locale
}) {
  const t = translator(locale)
  const [result, setResult] = useState<PdfPage[] | null>(null)
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
        const pages: PdfPage[] = []
        for (let i = 1; i <= pdf.numPages && active; i++) {
          const page = await pdf.getPage(i)
          const [content, annotations] = await Promise.all([
            page.getTextContent(),
            page.getAnnotations(),
          ])
          let text = ''
          for (const item of content.items) {
            if (!('str' in item)) continue
            text += item.str + (item.hasEOL ? '\n' : ' ')
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
          pages.push({ text: text.trim(), links })
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
