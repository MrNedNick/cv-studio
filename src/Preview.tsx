import { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { StudioDocument } from './model'
export default function Preview({ doc }: { doc: StudioDocument }) {
  const host = useRef<HTMLDivElement>(null),
    generation = useRef(0),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(false),
    [pages, setPages] = useState(1)
  useEffect(() => {
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
              doc.language === 'ru'
                ? `Резюме, страница ${i}`
                : `Resume, page ${i}`,
            )
            await page.render({ canvas, viewport }).promise
            fragment.appendChild(canvas)
          }
          if (generation.current === version && host.current) {
            host.current.replaceChildren(fragment)
            setPages(pdf.numPages)
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
  }, [doc])
  const ru = doc.language === 'ru'
  return (
    <>
      <div className="preview-status" aria-live="polite">
        {busy ? (
          <>
            <LoaderCircle className="spin" size={13} />
            {ru ? 'Обновляем просмотр…' : 'Updating preview…'}
          </>
        ) : error ? (
          ru ? (
            'Не удалось загрузить просмотр. Попробуйте обновить страницу.'
          ) : (
            'Preview could not load. Please refresh the page.'
          )
        ) : (
          `${ru ? 'Страниц' : 'Pages'}: ${pages} · A4 · ${ru ? 'Так будет выглядеть ваш PDF' : 'Exactly as in your PDF'}`
        )}
      </div>
      <div ref={host} className="pdf-pages" />
      {pages > 2 && (
        <p className="page-tip">
          {ru
            ? 'Получилось больше двух страниц. Попробуйте компактный шаблон или сократите описание опыта.'
            : 'More than two pages. Try the compact template or shorten older experience.'}
        </p>
      )}
    </>
  )
}
