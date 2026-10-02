import { MAX_PHOTO_LENGTH } from './model'

/**
 * Crops a picture to a 4:5 portrait around its centre and stores it as a small
 * JPEG, so the resume file and local storage stay light.
 */
export async function preparePhoto(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error('unsupported')
  if (file.size > 15_000_000) throw new Error('too-large')
  const bitmap = await createImageBitmap(file)
  try {
    const ratio = 4 / 5,
      width = Math.min(bitmap.width, bitmap.height * ratio),
      height = width / ratio,
      canvas = document.createElement('canvas')
    canvas.width = 360
    canvas.height = 450
    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      bitmap,
      (bitmap.width - width) / 2,
      (bitmap.height - height) / 2,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    for (const quality of [0.86, 0.75, 0.6]) {
      const url = canvas.toDataURL('image/jpeg', quality)
      if (url.length <= MAX_PHOTO_LENGTH) return url
    }
    throw new Error('too-large')
  } finally {
    bitmap.close()
  }
}
