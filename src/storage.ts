import { openDB } from 'idb'
import { parseDocument, type StudioDocument } from './model'
const db = () =>
  openDB('cv-studio', 1, {
    upgrade(database) {
      database.createObjectStore('documents')
    },
  })
export async function loadDocument(): Promise<StudioDocument | null> {
  const database = await db()
  try {
    const value = await database.get('documents', 'current')
    return value ? parseDocument(value) : null
  } finally {
    database.close()
  }
}
export async function saveDocument(value: StudioDocument) {
  const database = await db()
  try {
    await database.put('documents', value, 'current')
  } finally {
    database.close()
  }
}
