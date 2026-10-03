import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
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
import type { Locale, ResumeDocument } from './model'
import { translator } from './i18n'

const MIN_ZOOM = 25,
  MAX_ZOOM = 300,
  /** Width of the page at 100%, as in the stylesheet. */
  BASE_WIDTH = 680,
  A4_POINTS = 595.28
const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)))
/** Canvas resolution for a zoom level: sharp when enlarged, light at 100%. */
function scaleFor(zoom: number, fit: boolean) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2),
    needed = fit ? 0 : (BASE_WIDTH * (zoom / 100) * dpr) / A4_POINTS
  return Math.min(5, Math.max(1.7, Math.ceil(needed * 2) / 2))
}
type Anchor = { x: number; y: number; px: number; py: number }
export default function Preview({
  doc,
  locale = doc.language,
}: {
  doc: ResumeDocument
  locale?: Locale
}) {
  const t = translator(locale),
    pageLabel = useRef(t)
  pageLabel.current = t
  const host = useRef<HTMLDivElement>(null),
    scroller = useRef<HTMLDivElement>(null),
    /** The last rendered PDF, so zooming redraws pages without rebuilding the file. */
    source = useRef<ArrayBuffer | null>(null),
    anchor = useRef<Anchor | null>(null),
    pan = useRef<{ x: number; y: number; left: number; top: number } | null>(
      null,
    ),
    generation = useRef(0),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(false),
    [pages, setPages] = useState(1),
    [mode, setMode] = useState<'pdf' | 'text'>('pdf'),
    [zoom, setZoom] = useState(100),
    [fit, setFit] = useState(true),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0),
    [panning, setPanning] = useState(false),
    renderScale = scaleFor(zoom, fit),
    scaleRef = useRef(renderScale)
  scaleRef.current = renderScale
  async function draw(data: ArrayBuffer, scale: number, version: number) {
    const { getDocument } = await import('./pdf-reader')
    // pdf.js takes ownership of the buffer it reads; keep the cached copy intact.
    const task = getDocument({ data: data.slice(0) })
    try {
      const pdf = await task.promise,
        fragment = document.createDocumentFragment()
      for (let i = 1; i <= pdf.numPages; i++) {
        if (generation.current !== version) return false
        const page = await pdf.getPage(i),
          viewport = page.getViewport({ scale }),
          canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.setAttribute('role', 'img')
        canvas.setAttribute(
          'aria-label',
          pageLabel.current('Резюме, страница {page}', 'Resume, page {page}', {
            page: i,
          }),
        )
        await page.render({ canvas, viewport }).promise
        fragment.appendChild(canvas)
      }
      if (generation.current !== version || !host.current) return false
      host.current.replaceChildren(fragment)
      setPages(pdf.numPages)
      setPage((value) => Math.min(value, pdf.numPages))
      return true
    } finally {
      await task.destroy()
    }
  }
  useEffect(() => {
    if (mode === 'text') return
    const version = ++generation.current
    setBusy(true)
    setError(false)
    const timer = setTimeout(async () => {
      try {
        const { renderResume } = await import('./pdf')
        if (generation.current !== version) return
        const blob = await renderResume(doc)
        if (generation.current !== version) return
        const data = await blob.arrayBuffer()
        source.current = data
        if (await draw(data, scaleRef.current, version)) setBusy(false)
      } catch (error) {
        if (generation.current === version) {
          console.error(error)
          setBusy(false)
          setError(true)
        }
      }
    }, 120)
    return () => {
      clearTimeout(timer)
      generation.current++
    }
  }, [doc, retry, mode])
  // Enlarging redraws the cached PDF at a higher resolution, a moment after the last step.
  useEffect(() => {
    if (mode === 'text' || !source.current) return
    const data = source.current,
      version = ++generation.current
    const timer = setTimeout(() => {
      draw(data, renderScale, version).catch((error) => console.error(error))
    }, 160)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderScale])
  /** Changes the zoom and keeps the point under the cursor (or the centre) in place. */
  function changeZoom(next: number, at?: { x: number; y: number }) {
    const el = scroller.current
    next = clampZoom(next)
    if (el) {
      const px = at?.x ?? el.clientWidth / 2,
        py = at?.y ?? (fit ? 0 : el.clientHeight / 2)
      anchor.current = {
        x: fit ? 0.5 : (el.scrollLeft + px) / (el.scrollWidth || 1),
        y: fit ? 0 : (el.scrollTop + py) / (el.scrollHeight || 1),
        px,
        py,
      }
    }
    setFit(false)
    setZoom(next)
  }
  useLayoutEffect(() => {
    const el = scroller.current,
      point = anchor.current
    if (!el || !point) return
    anchor.current = null
    el.scrollLeft = point.x * el.scrollWidth - point.px
    el.scrollTop = point.y * el.scrollHeight - point.py
  }, [zoom, fit])
  // Ctrl/⌘ + wheel and trackpad pinch zoom around the cursor, like document viewers.
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  useEffect(() => {
    const el = scroller.current
    if (!el || mode !== 'pdf') return
    function wheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const box = el!.getBoundingClientRect()
      changeZoomRef.current(zoomRef.current * Math.exp(-event.deltaY * 0.01), {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      })
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  }, [mode])
  const changeZoomRef = useRef(changeZoom)
  changeZoomRef.current = changeZoom
  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    const el = scroller.current
    if (
      fit ||
      !el ||
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)
    )
      return
    event.preventDefault()
    el.setPointerCapture?.(event.pointerId)
    pan.current = {
      x: event.clientX,
      y: event.clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    }
    setPanning(true)
  }
  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const el = scroller.current,
      start = pan.current
    if (!el || !start) return
    el.scrollLeft = start.left - (event.clientX - start.x)
    el.scrollTop = start.top - (event.clientY - start.y)
  }
  function endPan() {
    pan.current = null
    setPanning(false)
  }
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
              disabled={!fit && zoom <= MIN_ZOOM}
              aria-label={t('Уменьшить', 'Zoom out')}
              onClick={() => changeZoom(Math.ceil(zoom / 25) * 25 - 25)}
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="zoom-reset"
              onClick={() => changeZoom(100)}
              aria-label={t('По ширине страницы', 'Fit to width')}
              title={t('По ширине страницы', 'Fit to width')}
            >
              {zoom}%
            </button>
            <button
              className="icon-button"
              disabled={!fit && zoom >= MAX_ZOOM}
              aria-label={t('Увеличить', 'Zoom in')}
              onClick={() => changeZoom(Math.floor(zoom / 25) * 25 + 25)}
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
            t('Страниц: {pages} · A4', 'Pages: {pages} · A4', { pages })
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
          ref={scroller}
          className={`preview-scroll ${fit ? 'is-fit' : 'is-zoomed'} ${panning ? 'is-panning' : ''}`}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          tabIndex={0}
          role="region"
          aria-label={
            fit
              ? t('Страница PDF целиком', 'Full PDF page')
              : t(
                  'Страницы PDF — перетаскивайте мышью или прокручивайте',
                  'PDF pages — drag or scroll to explore',
                )
          }
          aria-busy={busy}
          hidden={error}
        >
          <div
            ref={host}
            className="pdf-pages"
            style={
              fit
                ? undefined
                : ({ '--zoom': zoom / 100 } as React.CSSProperties)
            }
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
