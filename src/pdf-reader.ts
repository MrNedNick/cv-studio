import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { parseDocument } from './model'
GlobalWorkerOptions.workerSrc = worker
export { getDocument }
export async function importPdf(data: ArrayBuffer) {
  const task = getDocument({ data })
  try {
    const pdf = await task.promise
    const files = await pdf.getAttachments()
    const source = (
      Object.values(files || {}) as { filename: string; content: Uint8Array }[]
    ).find((file) => file.filename === 'neatcv.json')
    if (!source || source.content.length > 5_000_000)
      throw new Error('No resume source')
    return parseDocument(JSON.parse(new TextDecoder().decode(source.content)))
  } finally {
    await task.destroy()
  }
}
