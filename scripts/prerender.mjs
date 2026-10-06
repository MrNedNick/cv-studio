import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

export async function prerender(outDir) {
  const directory = resolve(outDir)
  const original = await readFile(join(directory, 'index.html'), 'utf8')
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    ssr: {
      noExternal: ['react-router-dom', 'react-router'],
      resolve: { conditions: ['module', 'import', 'development'] },
    },
  })
  try {
    const {
      renderPublicPage,
      publicPaths,
      publicMetadata,
      publicUrl,
      faq,
      publicLocales,
      homePath,
      homeLocale,
    } = await server.ssrLoadModule('/src/prerender.tsx')
    for (const path of publicPaths) {
      const meta = publicMetadata(path)
      const locale = homeLocale(path) ?? 'en'
      const route = homeLocale(path) ? '/' : path
      const root = `<div id="root" data-public-path="${route}" data-public-locale="${locale}">${await renderPublicPage(path)}</div>`
      let html = original
        .replace('<html lang="en">', `<html lang="${locale}">`)
        .replace('<div id="root"></div>', root)
        .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
        .replace(
          /(<meta\s+name="description"\s+content=")[^"]*(")/,
          `$1${meta.description}$2`,
        )
        .replace(/(rel="canonical" href=")[^"]*(")/, `$1${publicUrl(path)}$2`)
        .replace(
          /(property="og:url" content=")[^"]*(")/,
          `$1${publicUrl(path)}$2`,
        )
        .replace(
          /((?:property="og:title"|name="twitter:title")\s+content=")[^"]*(")/g,
          `$1${meta.title}$2`,
        )
        .replace(
          /((?:property="og:description"|name="twitter:description")\s+content=")[^"]*(")/g,
          `$1${meta.description}$2`,
        )
      const ogLocales = {
        en: 'en_US',
        de: 'de_DE',
        es: 'es_ES',
        bg: 'bg_BG',
        uk: 'uk_UA',
        ru: 'ru_RU',
      }
      html = html
        .replace(/\s*<meta property="og:locale(?::alternate)?"[^>]*>/g, '')
        .replace(
          '</head>',
          `<meta property="og:locale" content="${ogLocales[locale]}" />${
            homeLocale(path)
              ? publicLocales
                  .filter((value) => value !== locale)
                  .map(
                    (value) =>
                      `<meta property="og:locale:alternate" content="${ogLocales[value]}" />`,
                  )
                  .join('')
              : ''
          }</head>`,
        )
      if (homeLocale(path)) {
        const alternatives = [
          ...publicLocales.map(
            (value) =>
              `<link rel="alternate" hreflang="${value}" href="${publicUrl(homePath(value))}" />`,
          ),
          `<link rel="alternate" hreflang="x-default" href="${publicUrl('/')}" />`,
        ]
        html = html.replace('</head>', `${alternatives.join('\n')}</head>`)
      }
      if (path === '/help') {
        const data = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question.en,
            acceptedAnswer: { '@type': 'Answer', text: item.answer.en },
          })),
        }
        html = html.replace(
          '</head>',
          `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script></head>`,
        )
      }
      const folder = path === '/' ? directory : join(directory, path.slice(1))
      await mkdir(folder, { recursive: true })
      await writeFile(join(folder, 'index.html'), html)
    }
    const urls = [
      ...publicPaths.map(publicUrl),
      'https://neatcv.cc/privacy.html',
    ]
    await writeFile(
      join(directory, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,
    )
    console.log(`Prerendered ${publicPaths.length} public pages.`)
  } finally {
    await server.close()
  }
}
