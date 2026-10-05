import { expect, test, type Locator } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { downloadPdf, openExample, step } from './helpers.ts'

async function transitionFrames(element: Locator) {
  return element.evaluate(async (trigger) => {
    const el = document.getElementById(trigger.getAttribute('aria-controls')!)!
    ;(trigger as HTMLElement).click()
    const heights: number[] = []
    for (let i = 0; i < 4; i++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      )
      heights.push(el.getBoundingClientRect().height)
    }
    return heights
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const reduced of ['no-preference', 'reduce'] as const) {
    test.describe(`${theme} / ${reduced}`, () => {
      test.use({ colorScheme: theme, reducedMotion: reduced })
      test('panels close before removal, reverse cleanly and return focus', async ({
        page,
        isMobile,
      }) => {
        test.setTimeout(60000)
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        await page.goto('./components.html')
        const toggle = page.getByRole('button', { name: 'Expandable details' })
        const body = page.locator('.gallery-disclosure > .collapse')
        const openingHeights = await transitionFrames(toggle)
        await expect(body).toBeVisible()
        await page.waitForFunction(() =>
          document
            .querySelector('.gallery-disclosure .collapse')
            ?.getAnimations()
            .every((a) => a.playState !== 'running'),
        )
        const full = await body.evaluate(
          (el) => el.getBoundingClientRect().height,
        )
        if (reduced === 'no-preference')
          expect(Math.min(...openingHeights)).toBeLessThan(full)
        const heights = await transitionFrames(toggle)
        await expect(body).toHaveAttribute('inert', '')
        if (reduced === 'no-preference') {
          expect(Math.min(...heights)).toBeLessThan(full)
          expect(Math.max(...heights)).toBeGreaterThan(0)
        }
        await toggle.click()
        await expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await expect(
          page.getByLabel('A field inside the expanded block'),
        ).toBeVisible()
        await toggle.click()
        await expect(body).not.toBeVisible()
        const opener = page.getByRole('button', {
          name: 'Open dialog',
          exact: true,
        })
        await opener.click()
        await page.getByRole('dialog').press('Escape')
        await expect(page.locator('dialog.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(opener).toBeFocused()
        await opener.click()
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'Close dialog', exact: true })
          .click()
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(opener).toBeFocused()

        await openExample(page)
        await step(page, 'Experience')
        const gotIt = page.getByRole('button', { name: 'Got it', exact: true })
        await expect(gotIt).toBeVisible()
        await gotIt.click()
        const entry = page.locator('.entry-card').first()
        const entryToggle = entry.locator('.entry-toggle')
        await entryToggle.click()
        await expect(entry.locator(':scope > .collapse')).not.toBeVisible()
        await entryToggle.click()
        await expect(entry.locator(':scope > .collapse')).toBeVisible()
        const writing = page.getByRole('button', {
          name: 'How to write this section',
        })
        await writing.click()
        await page
          .getByRole('dialog', {
            name: 'How to write: Experience',
            exact: true,
          })
          .press('Escape')
        await expect(page.locator('dialog.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('dialog')).toHaveCount(0)
        await expect(writing).toBeFocused()
        const titles = await page
          .locator('.entry-toggle strong')
          .allTextContents()
        await page.locator('.entry-card .delete').evaluateAll((buttons) => {
          for (const button of buttons) (button as HTMLElement).click()
        })
        await expect(page.locator('.entry-card')).toHaveCount(0)
        for (const count of [1, 2]) {
          if (isMobile)
            await page
              .getByRole('button', { name: 'Resume actions', exact: true })
              .click()
          await page.getByRole('button', { name: 'Undo', exact: true }).click()
          await expect(page.locator('#document-menu')).toHaveCount(0)
          await expect(page.locator('.entry-card')).toHaveCount(count)
        }
        await expect(page.locator('.entry-toggle strong')).toHaveText(titles)
        const actions = page.getByRole('button', {
          name: 'Resume actions',
          exact: true,
        })
        await actions.click()
        await page.keyboard.press('Escape')
        await expect(page.locator('#document-menu.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('#document-menu')).toHaveCount(0)
        await expect(actions).toBeFocused()
        if (isMobile) {
          const picker = page.getByRole('button', {
            name: 'Resume steps',
            exact: true,
          })
          await picker.click()
          await page.getByRole('dialog').press('Escape')
          await expect(page.locator('dialog.is-closing')).toHaveAttribute(
            'inert',
            '',
          )
          await expect(page.locator('dialog')).toHaveCount(0)
          await expect(picker).toBeFocused()
        }
        await downloadPdf(page, 'For sharing')
        await expect(page.locator('.backup-toast')).toBeVisible()
        await page.getByRole('button', { name: 'Dismiss notification' }).click()
        await expect(page.locator('.backup-toast.is-closing')).toHaveAttribute(
          'inert',
          '',
        )
        await expect(page.locator('.backup-toast')).toHaveCount(0)
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.playState !== 'running'),
        )
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
        expect(errors).toEqual([])
      })
    })
  }
}

async function layoutFrames(trigger: Locator, reverseAt: number[] = []) {
  return trigger.evaluate(async (button, reverseAt) => {
    const form = document.querySelector<HTMLElement>('.editor-form')!
    const heading = form.querySelector('h1')!
    const banner = form.querySelector('.sample-banner')
    const read = () => ({
      width: form.getBoundingClientRect().width,
      contentWidth: form.clientWidth,
      heading: heading.getBoundingClientRect().y,
      opacity: Number(getComputedStyle(form).opacity),
      scroll: form.scrollTop,
      bannerHeight: banner?.getBoundingClientRect().height ?? 0,
      bodyHeight:
        form
          .querySelector('.section-fields')
          ?.parentElement?.getBoundingClientRect().height ?? 0,
      frozenWidth: form.parentElement?.style.getPropertyValue('--form-freeze'),
      gutter: form.parentElement?.style.getPropertyValue('--form-scrollbar'),
      bannerWidth: banner?.getBoundingClientRect().width ?? 0,
    })
    const frames = [read()]
    ;(button as HTMLElement).click()
    const start = performance.now()
    for (let i = 0; performance.now() - start < 500; i++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      )
      frames.push(read())
      if (reverseAt.includes(i)) (button as HTMLElement).click()
    }
    return frames
  }, reverseAt)
}

function staysStill(values: number[], tolerance = 1.1) {
  expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(
    tolerance,
  )
}
function monotonic(values: number[], direction: 'up' | 'down') {
  for (let i = 1; i < values.length; i++)
    expect(
      direction === 'up'
        ? values[i] - values[i - 1]
        : values[i - 1] - values[i],
    ).toBeGreaterThanOrEqual(-1.1)
}

async function themeFrames(trigger: Locator, reverseAt: number[] = []) {
  return trigger.evaluate(async (button, reverseAt) => {
    const root = document.documentElement
    const form = document.querySelector<HTMLElement>('.editor-form')!
    const input = form.querySelector('.field input')!
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    const pixel = (color: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
    }
    const read = () => ({
      theme: root.dataset.theme,
      background: pixel(getComputedStyle(root).backgroundColor),
      surface: pixel(getComputedStyle(form).backgroundColor),
      text: pixel(getComputedStyle(form).color),
      border: pixel(getComputedStyle(input).borderTopColor),
      heading: form.querySelector('h1')!.getBoundingClientRect().y,
      contentWidth: form.clientWidth,
      opacity: Number(getComputedStyle(form).opacity),
    })
    const frames = [read()]
    ;(button as HTMLElement).click()
    const start = performance.now()
    for (let i = 0; performance.now() - start < 450; i++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      )
      frames.push(read())
      if (reverseAt.includes(i)) (button as HTMLElement).click()
    }
    return frames
  }, reverseAt)
}

async function settle(page: import('@playwright/test').Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  )
}

for (const theme of ['light', 'dark'] as const) {
  for (const reduced of ['no-preference', 'reduce'] as const) {
    test.describe(`stable workspace / ${theme} / ${reduced}`, () => {
      test.use({ colorScheme: theme, reducedMotion: reduced })
      test('theme colors blend, reverse and persist without moving the form', async ({
        page,
        isMobile,
      }, testInfo) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text())
        })
        if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
        await openExample(page)
        await step(page, 'Experience')
        await page.getByRole('button', { name: 'Got it', exact: true }).click()
        await settle(page)
        const toggle = page.getByRole('button', {
          name: 'Toggle color theme',
          exact: true,
        })
        const frames = await themeFrames(toggle)
        await testInfo.attach('theme-frames', {
          body: JSON.stringify(frames),
          contentType: 'application/json',
        })
        const next = theme === 'light' ? 'dark' : 'light'
        expect(frames.at(-1)!.theme).toBe(next)
        for (const key of [
          'background',
          'surface',
          'text',
          'border',
        ] as const) {
          expect(frames[0][key]).not.toEqual(frames.at(-1)![key])
          expect(
            new Set(frames.map((f) => JSON.stringify(f[key]))).size,
          ).toBeGreaterThan(2)
        }
        staysStill(frames.map((f) => f.heading))
        staysStill(frames.map((f) => f.contentWidth))
        const reversed = await themeFrames(toggle, [2, 5])
        expect(reversed.at(-1)!.theme).toBe(theme)
        staysStill(reversed.map((f) => f.heading))
        expect(reversed.at(-1)!.background).toEqual(frames[0].background)
        const entry = page.locator('.entry-toggle').first()
        await entry.evaluate((el) => (el as HTMLElement).click())
        const simultaneous = await themeFrames(toggle)
        staysStill(simultaneous.map((f) => f.heading))
        staysStill(simultaneous.map((f) => f.contentWidth))
        await expect(entry).toHaveAttribute('aria-expanded', 'false')
        await entry.click()
        await settle(page)
        if (!isMobile) {
          const form = page.getByRole('button', { name: 'Form', exact: true })
          await form.evaluate((el) => (el as HTMLElement).click())
          const slide = await themeFrames(toggle)
          staysStill(
            slide.filter((f) => f.opacity > 0.05).map((f) => f.heading),
          )
          await expect(form).toHaveAttribute('aria-pressed', 'false')
          await form.click()
          await settle(page)
        }
        const saved = await page.locator('html').getAttribute('data-theme')
        await page.reload()
        await step(page, 'Experience')
        await expect(
          page.getByLabel('Job title', { exact: true }).first(),
        ).toHaveValue('Product designer')
        await expect(page.locator('html')).toHaveAttribute('data-theme', saved!)
        await expect(page.locator('html')).not.toHaveAttribute(
          'data-theme-animated',
        )
        expect(
          await page
            .locator('html')
            .evaluate((el) => el.getAnimations().length),
        ).toBe(0)
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        expect(errors).toEqual([])
        await page.screenshot({ path: testInfo.outputPath('smooth-theme.png') })
      })
      test('visibility and interrupted entry transitions keep the form steady', async ({
        page,
        isMobile,
      }, testInfo) => {
        test.setTimeout(90000)
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => {
          if (m.type() === 'error') errors.push(m.text())
        })
        if (isMobile) await page.setViewportSize({ width: 360, height: 780 })
        await openExample(page)
        await step(page, 'Experience')
        await page.getByRole('button', { name: 'Got it', exact: true }).click()
        await settle(page)
        const visibility = isMobile
          ? page.getByRole('switch', { name: 'In resume', exact: true })
          : page.getByRole('button', {
              name: 'Experience in resume',
              exact: true,
            })
        for (const direction of ['down', 'up'] as const) {
          const frames = await layoutFrames(visibility)
          staysStill(frames.map((f) => f.heading))
          staysStill(frames.map((f) => f.contentWidth))
          if (reduced === 'no-preference')
            monotonic(
              frames.map((f) => f.bodyHeight),
              direction,
            )
        }
        await layoutFrames(visibility, [2, 5])
        await expect(page.locator('.section-fields')).not.toBeVisible()
        await layoutFrames(visibility)
        await expect(
          page.getByLabel('Job title', { exact: true }).first(),
        ).toHaveValue('Product designer')
        const entryToggle = page.locator('.entry-toggle').first()
        await layoutFrames(entryToggle, [2, 5])
        await expect(entryToggle).toHaveAttribute('aria-expanded', 'false')
        await expect(
          page.locator('.entry-card > .collapse').first(),
        ).not.toBeVisible()
        await layoutFrames(entryToggle)
        await expect(entryToggle).toHaveAttribute('aria-expanded', 'true')
        // Closing from the bottom must only clamp scrolling toward the top, never bounce back.
        await page.locator('.editor-form').evaluate((el) => {
          el.scrollTop = el.scrollHeight
        })
        const scrolled = await layoutFrames(visibility)
        monotonic(
          scrolled.map((f) => f.scroll),
          'down',
        )
        await layoutFrames(visibility)
        if (!isMobile) {
          // A different section's eye must not affect the current form or its scroll position.
          await page.locator('.editor-form').evaluate((el) => {
            el.scrollTop = 170
          })
          const unrelated = await layoutFrames(
            page.getByRole('button', {
              name: 'Education in resume',
              exact: true,
            }),
          )
          staysStill(unrelated.map((f) => f.heading))
          staysStill(unrelated.map((f) => f.contentWidth))
          staysStill(unrelated.map((f) => f.scroll))
          await page
            .getByRole('button', { name: 'Education in resume', exact: true })
            .click()
        }
        await settle(page)
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        expect(errors).toEqual([])
        await page.locator('.editor-form').evaluate((el) => {
          el.scrollTop = 0
        })
        await page.screenshot({
          path: testInfo.outputPath('stable-workspace.png'),
        })
      })
      test('desktop panel controls preserve text geometry through repeated reversals and reload', async ({
        page,
        isMobile,
      }) => {
        test.skip(isMobile, 'Desktop split view only')
        test.setTimeout(90000)
        await openExample(page)
        await step(page, 'Experience')
        await page.getByRole('button', { name: 'Got it', exact: true }).click()
        await settle(page)
        for (const name of ['Sections', 'Sections']) {
          const frames = await layoutFrames(
            page.getByRole('button', { name, exact: true }),
          )
          staysStill(frames.map((f) => f.contentWidth))
          staysStill(frames.map((f) => f.heading))
          staysStill(frames.map((f) => f.bannerHeight))
        }
        const formButton = page.getByRole('button', {
          name: 'Form',
          exact: true,
        })
        const before = await page.locator('.editor-form h1').boundingBox()
        for (const reversals of [[], [], [2, 5], [2, 5]]) {
          const frames = await layoutFrames(formButton, reversals)
          const visible = frames.filter((f) => f.opacity > 0.05)
          staysStill(visible.map((f) => f.heading))
          staysStill(visible.map((f) => f.bannerHeight))
        }
        await expect(formButton).toHaveAttribute('aria-pressed', 'true')
        const after = await page.locator('.editor-form h1').boundingBox()
        expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(1.1)
        await formButton.click()
        await settle(page)
        await page.reload()
        await expect(formButton).toHaveAttribute('aria-pressed', 'false')
        await settle(page)
        const reopened = await layoutFrames(formButton)
        const visible = reopened.filter((f) => f.opacity > 0.05)
        staysStill(visible.map((f) => f.heading))
        staysStill(visible.map((f) => f.bannerHeight))
        const splitter = page.getByRole('separator', { name: 'Form width' })
        await splitter.press('Home')
        await splitter.press('End')
        await splitter.dblclick()
        await settle(page)
        const width = await page
          .locator('.editor-form')
          .evaluate((el) => el.getBoundingClientRect().width)
        await page
          .getByRole('button', { name: 'Sections', exact: true })
          .click()
        await settle(page)
        await page.reload()
        await expect(formButton).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Sections', exact: true }),
        ).toHaveAttribute('aria-pressed', 'false')
        expect(
          Math.abs(
            (await page
              .locator('.editor-form')
              .evaluate((el) => el.getBoundingClientRect().width)) - width,
          ),
        ).toBeLessThanOrEqual(1.1)
        for (const size of [1050, 1280, 1920]) {
          await page.setViewportSize({ width: size, height: 900 })
          await settle(page)
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true)
          const frames = await layoutFrames(
            page.getByRole('button', { name: 'Sections', exact: true }),
          )
          staysStill(frames.map((f) => f.contentWidth))
          staysStill(frames.map((f) => f.heading))
        }
        await splitter.press('End')
        await settle(page)
        await page.setViewportSize({ width: 1050, height: 900 })
        await settle(page)
        expect(
          await page
            .locator('.preview-panel')
            .evaluate((el) => el.getBoundingClientRect().right),
        ).toBeLessThanOrEqual(1051)
        await formButton.click()
        await settle(page)
        const narrow = await layoutFrames(formButton)
        await test.info().attach('narrow-panel-frames', {
          body: JSON.stringify(narrow),
          contentType: 'application/json',
        })
        staysStill(narrow.filter((f) => f.opacity > 0.05).map((f) => f.heading))
        expect(
          await page
            .locator('.preview-panel')
            .evaluate((el) => el.getBoundingClientRect().right),
        ).toBeLessThanOrEqual(1051)
        const undoDismissal = await page
          .getByRole('button', { name: 'Keep the example', exact: true })
          .evaluate(async (button) => {
            const body = button.closest('.sample-banner')!.parentElement!
            const full = body.getBoundingClientRect().height
            ;(button as HTMLElement).click()
            await new Promise((resolve) => setTimeout(resolve, 80))
            const closing = body.getBoundingClientRect().height
            ;(
              document.querySelector('button[aria-label="Undo"]') as HTMLElement
            ).click()
            for (let i = 0; i < 2; i++)
              await new Promise<void>((resolve) =>
                requestAnimationFrame(() => resolve()),
              )
            return {
              full,
              closing,
              reopened: body.getBoundingClientRect().height,
            }
          })
        if (reduced === 'no-preference') {
          expect(undoDismissal.closing).toBeLessThan(undoDismissal.full)
          expect(undoDismissal.reopened).toBeLessThan(undoDismissal.full)
        }
        await settle(page)
        await expect(
          page.getByRole('button', { name: 'Keep the example', exact: true }),
        ).toBeVisible()
        const dismissed = await layoutFrames(
          page.getByRole('button', { name: 'Keep the example', exact: true }),
        )
        monotonic(
          dismissed.map((f) => f.heading),
          'down',
        )
        await expect(page.locator('.sample-banner')).toHaveCount(0)
        await expect(page.locator('.editor-form h1')).toBeFocused()
        for (const count of [1, 2]) {
          const frames = await layoutFrames(formButton)
          staysStill(
            frames.filter((f) => f.opacity > 0.05).map((f) => f.heading),
          )
          await expect(formButton).toHaveAttribute(
            'aria-pressed',
            count === 1 ? 'false' : 'true',
          )
        }
        const grip = splitter.locator('.resizer-grip')
        await grip.hover()
        const handle = (await grip.boundingBox())!
        const left = (await page.locator('.editor-form').boundingBox())!.x
        await page.mouse.down()
        await expect(page.locator('.editor-body')).toHaveClass(/is-resizing/)
        await page.mouse.move(left + 360, handle.y + handle.height / 2, {
          steps: 4,
        })
        await expect
          .poll(async () =>
            Math.abs(
              (await page
                .locator('.editor-form')
                .evaluate((el) => el.getBoundingClientRect().width)) - 360,
            ),
          )
          .toBeLessThan(1.1)
        await page.mouse.up()
        await expect(splitter).toHaveAttribute('aria-valuenow', '360')
      })
    })
  }
}
