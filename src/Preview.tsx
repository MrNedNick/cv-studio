import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  LoaderCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Scan,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import ResumeText from './ResumeText'
import type { Locale, StudioDocument } from './model'
import { translator } from './i18n'
export default function Preview({
  doc,
  locale = doc.language,
}: {
  doc: StudioDocument
  locale?: Locale
}) {
  const t = translator(locale),
    pageLabel = useRef(t)
  pageLabel.current = t
  const host = useRef<HTMLDivElement>(null),
    generation = useRef(0),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(false),
    [pages, setPages] = useState(1),
    [mode, setMode] = useState<'pdf' | 'text'>('pdf'),
    [zoom, setZoom] = useState(100),
    [fit, setFit] = useState(true),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0)
  useEffect(() => {
    if (mode === 'text') return
    const version = ++generation.current
    setBusy(true)
    setError(false)
    const timer = setTimeout(async () => {
      try {
        const [{ renderResume }, { getDocument }] = await Promise.all([
          import('./pdf'),
          import('./pdf-reader'),
        ])
        if (generation.current !== version) return
        const blob = await renderResume(doc)
        if (generation.current !== version) return
        const task = getDocument({ data: await blob.arrayBuffer() })
        try {
          const pdf = await task.promise,
            fragment = document.createDocumentFragment()
          for (let i = 1; i <= pdf.numPages; i++) {
            if (generation.current !== version) return
            const page = await pdf.getPage(i),
              viewport = page.getViewport({ scale: 1.7 }),
              canvas = document.createElement('canvas')
            canvas.width = viewport.width
            canvas.height = viewport.height
            canvas.setAttribute('role', 'img')
            canvas.setAttribute(
              'aria-label',
              pageLabel.current(
                'Резюме, страница {page}',
                'Resume, page {page}',
                {
                  page: i,
                },
              ),
            )
            await page.render({ canvas, viewport }).promise
            fragment.appendChild(canvas)
          }
          if (generation.current === version && host.current) {
            host.current.replaceChildren(fragment)
            setPages(pdf.numPages)
            setPage((value) => Math.min(value, pdf.numPages))
            setBusy(false)
          }
        } finally {
          await task.destroy()
        }
      } catch (error) {
        if (generation.current === version) {
          console.error(error)
          setBusy(false)
          setError(true)
        }
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      generation.current++
    }
  }, [doc, retry, mode])
  useLayoutEffect(() => {
    host.current?.querySelectorAll('canvas').forEach((canvas, i) => {
      canvas.hidden = fit && i + 1 !== page
    })
  }, [page, fit, pages, busy])
  return (
    <>
      <div className="preview-controls">
        <div
          className="preview-modes"
          role="group"
          aria-label={t('Вид просмотра', 'Preview mode')}
        >
          <button aria-pressed={mode === 'pdf'} onClick={() => setMode('pdf')}>
            PDF
          </button>
          <button
            aria-pressed={mode === 'text'}
            onClick={() => setMode('text')}
          >
            {t('Текст', 'Text')}
          </button>
        </div>
        {mode === 'pdf' && (
          <div
            className="zoom-controls"
            role="group"
            aria-label={t('Масштаб просмотра', 'Preview zoom')}
          >
            <button
              className="fit-page-button"
              aria-pressed={fit}
              onClick={() => setFit(true)}
              title={t('Вся страница', 'Fit page')}
            >
              <Scan size={15} />
              {t('Вся страница', 'Fit page')}
            </button>
            <button
              className="icon-button"
              disabled={zoom <= 75}
              aria-label={t('Уменьшить', 'Zoom out')}
              onClick={() => {
                setFit(false)
                setZoom((value) => value - 25)
              }}
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="zoom-reset"
              onClick={() => {
                setFit(false)
                setZoom(100)
              }}
              aria-label={t('По ширине страницы', 'Fit to width')}
              title={t('По ширине страницы', 'Fit to width')}
            >
              {zoom}%
            </button>
            <button
              className="icon-button"
              disabled={zoom >= 200}
              aria-label={t('Увеличить', 'Zoom in')}
              onClick={() => {
                setFit(false)
                setZoom((value) => value + 25)
              }}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        )}
      </div>
      {mode === 'text' && (
        <>
          <p className="text-preview-note">
            {t(
              'Для чтения и копирования. Оформление документа — во вкладке PDF.',
              'For reading and copying. See the PDF tab for the document layout.',
            )}
          </p>
          <ResumeText doc={doc} locale={locale} />
        </>
      )}
      <div className="pdf-preview-content" hidden={mode !== 'pdf'}>
        <div className="preview-status" aria-live="polite">
          {busy ? (
            <>
              <LoaderCircle className="spin" size={13} />
              {t('Обновляем просмотр…', 'Updating preview…')}
            </>
          ) : error ? (
            t(
              'Не удалось загрузить PDF. Можно повторить попытку или открыть текст.',
              'PDF preview could not load. Retry or switch to text.',
            )
          ) : (
            t(
              'Страниц: {pages} · A4 · Так будет выглядеть ваш PDF',
              'Pages: {pages} · A4 · Exactly as in your PDF',
              { pages },
            )
          )}
        </div>
        {error && (
          <button
            className="button secondary preview-retry"
            onClick={() => setRetry((value) => value + 1)}
          >
            <RotateCcw size={15} />
            {t('Повторить загрузку', 'Retry preview')}
          </button>
        )}
        <div
          className={`preview-scroll ${fit ? 'is-fit' : ''}`}
          tabIndex={0}
          role="region"
          aria-label={
            fit
              ? t('Страница PDF целиком', 'Full PDF page')
              : t(
                  'Страницы PDF — прокрутите для просмотра',
                  'PDF pages — scroll to explore',
                )
          }
          aria-busy={busy}
          hidden={error}
        >
          <div
            ref={host}
            className="pdf-pages"
            style={fit ? undefined : { width: `${zoom}%` }}
          />
        </div>
        {fit && pages > 1 && !error && (
          <div
            className="page-navigation"
            role="group"
            aria-label={t('Страницы PDF', 'PDF pages')}
          >
            <button
              className="icon-button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              aria-label={t('Предыдущая страница', 'Previous page')}
            >
              <ChevronLeft size={17} />
            </button>
            <span aria-live="polite">
              {t('Страница', 'Page')} {page} / {pages}
            </span>
            <button
              className="icon-button"
              disabled={page === pages}
              onClick={() => setPage((value) => value + 1)}
              aria-label={t('Следующая страница', 'Next page')}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}
        {pages > 2 && (
          <p className="page-tip">
            {t(
              'Получилось больше двух страниц. Попробуйте компактный шаблон или сократите описание опыта.',
              'More than two pages. Try the compact template or shorten older experience.',
            )}
          </p>
        )}
      </div>
    </>
  )
}
