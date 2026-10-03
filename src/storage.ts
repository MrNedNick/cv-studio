import { openDB } from 'idb'
import { parseDocument, type ResumeDocument } from './model'
const db = () =>
  openDB('neatcv', 1, {
    upgrade(database) {
      database.createObjectStore('documents')
    },
  })
export async function loadDocument(): Promise<ResumeDocument | null> {
  const database = await db()
  try {
    const value = await database.get('documents', 'current')
    return value ? parseDocument(value) : null
  } finally {
    database.close()
  }
}
export async function saveDocument(value: ResumeDocument) {
  const database = await db()
  try {
    await database.put('documents', value, 'current')
  } finally {
    database.close()
  }
}

let persistAsked = false
/**
 * Asks the browser to keep the resume when it clears site data on its own
 * (Safari drops it after seven days without a visit). Asked once, after the
 * first real save, so a first look at the site never triggers a prompt.
 */
export async function keepStorage() {
  if (persistAsked) return
  persistAsked = true
  try {
    if (await navigator.storage?.persisted?.()) return
    await navigator.storage?.persist?.()
  } catch {
    /* Not supported here; the backup reminders still apply. */
  }
}
