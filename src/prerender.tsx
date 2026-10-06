import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import App from './App'
import { homeLocale } from './public-pages'
import { loadLocale } from './i18n'
export {
  publicPaths,
  publicMetadata,
  publicUrl,
  publicLocales,
  homePath,
  homeLocale,
} from './public-pages'
export { faq } from './Faq'

export async function renderPublicPage(path: string) {
  const locale = homeLocale(path) ?? 'en'
  const route = homeLocale(path) ? '/' : path
  await loadLocale(locale)
  const html = renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={[route]}>
        <App bootstrap={{ locale, path: route }} />
      </MemoryRouter>
    </StrictMode>,
  )
  // Match HashRouter's hrefs when attaching the same tree in the browser.
  return html.replace(/href="\/(?:templates|edit)?"/g, (value) =>
    value.replace('href="/', 'href="#/'),
  )
}
