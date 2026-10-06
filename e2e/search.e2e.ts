import { expect, test } from '@playwright/test'

const canonical = ['https://neatcv.cc/', 'https://neatcv.cc/privacy.html']

test('robots and sitemap expose only canonical public pages that can be crawled', async ({
  request,
  page,
}) => {
  const robots = await request.get('./robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toMatch(
    /User-agent: \*\s+Allow: \/\s+Sitemap: https:\/\/neatcv\.cc\/sitemap\.xml/,
  )
  const sitemap = await request.get('./sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(sitemap.headers()['content-type']).toMatch(/xml/)
  const locations = await page.evaluate(
    (xml) => {
      const document = new DOMParser().parseFromString(xml, 'application/xml')
      if (document.querySelector('parsererror'))
        throw new Error('Invalid sitemap XML')
      if (
        document.documentElement.namespaceURI !==
        'http://www.sitemaps.org/schemas/sitemap/0.9'
      )
        throw new Error('Invalid sitemap namespace')
      return [...document.querySelectorAll('url > loc')].map(
        (item) => item.textContent,
      )
    },
    await sitemap.text(),
  )
  expect(locations).toEqual(canonical)
  for (const location of canonical) {
    const response = await request.get(new URL(location).pathname)
    expect(response.status()).toBe(200)
    expect(response.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex/i)
    const html = await response.text()
    expect(html).toContain(`rel="canonical" href="${location}"`)
    expect(html).not.toMatch(/name="robots"[^>]*content="[^"]*noindex/i)
  }
  const components = await request.get('./components.html')
  expect(components.status()).toBe(200)
  expect(await components.text()).toMatch(/name="robots" content="noindex"/)
})

test('crawler-facing metadata describes the free product and its author without JavaScript', async ({
  request,
}) => {
  for (const userAgent of ['Googlebot', 'bingbot']) {
    const response = await request.get('./', {
      headers: { 'User-Agent': userAgent },
    })
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(
      '<title>NeatCV — free resume builder with PDF download</title>',
    )
    const json = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )![1]
    const data = JSON.parse(json)
    expect(data).toMatchObject({
      '@type': 'WebApplication',
      url: canonical[0],
      isAccessibleForFree: true,
      offers: { price: '0' },
      author: { name: 'Nikita Nedyalkov' },
    })
    expect(data.inLanguage).toHaveLength(6)
    expect(html).toContain('<noscript>')
  }
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('home explains the product and links to the readable privacy notice', async ({
    page,
  }) => {
    await page.goto('./')
    await expect(
      page.getByRole('heading', { name: 'NeatCV — free resume builder' }),
    ).toBeVisible()
    await expect(
      page.getByText(/Enable JavaScript to use the editor/),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Nikita Nedyalkov' }),
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/mrnednick/')
    await page.getByRole('link', { name: 'Privacy', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Privacy — NeatCV' }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Back to NeatCV' }).click()
    await expect(page).toHaveTitle(
      'NeatCV — free resume builder with PDF download',
    )
  })
})
