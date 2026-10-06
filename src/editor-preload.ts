type Connection = { saveData?: boolean; effectiveType?: string }

/** Optional loading must never interrupt the page or consume a restricted connection. */
export function scheduleEditorPreload(load: () => Promise<unknown>) {
  const allowed = () => {
    const connection = (navigator as Navigator & { connection?: Connection })
      .connection
    return (
      navigator.onLine !== false &&
      !document.hidden &&
      !connection?.saveData &&
      !['slow-2g', '2g'].includes(connection?.effectiveType ?? '')
    )
  }
  if (!allowed()) return () => {}
  let cancelled = false
  const run = () => {
    if (cancelled || !allowed()) return
    void Promise.resolve()
      .then(load)
      .catch(() => {
        // Optional loading must not show an error over a working public page.
      })
  }
  const idle = Boolean(window.requestIdleCallback)
  const id = idle
    ? window.requestIdleCallback(run, { timeout: 3000 })
    : window.setTimeout(run, 1500)
  return () => {
    cancelled = true
    if (idle) window.cancelIdleCallback?.(id)
    else window.clearTimeout(id)
  }
}
