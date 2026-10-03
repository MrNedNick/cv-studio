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
