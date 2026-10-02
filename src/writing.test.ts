import { expect, it } from 'vitest'
import { matchJob, reviewResume } from './writing'
import { createDocument, emptyEntry } from './model'

it('passes a strong example and flags weak writing with reasons', () => {
  const doc = createDocument(true, 'en'),
    resume = doc.versions.en
  const passing = reviewResume(resume, 'en').filter((c) => c.ok).length
  resume.basics.summary = 'I am a hard-working team player.'
  resume.work[0].description =
    'Responsible for the checkout page\nHelped the team with releases'
  resume.work = resume.work.slice(0, 1)
  const checks = reviewResume(resume, 'en'),
    byId = Object.fromEntries(checks.map((c) => [c.id, c]))
  expect(byId.verbs.ok).toBe(false)
  expect(byId.verbs.detail).toContain('Responsible for the checkout page')
  expect(byId.cliches.ok).toBe(false)
  expect(byId.pronouns.ok).toBe(false)
  expect(byId.numbers.ok).toBe(false)
  expect(byId.experience.ok).toBe(false)
  expect(checks.filter((c) => c.ok).length).toBeLessThan(passing)
})

it('recognizes Russian weak phrases and pronouns without matching inside words', () => {
  const resume = createDocument(true, 'ru').versions.ru
  resume.basics.summary = 'Проектирую явные и понятные интерфейсы для команды.'
  expect(reviewResume(resume, 'ru').find((c) => c.id === 'pronouns')?.ok).toBe(
    true,
  )
  resume.work[0].description = 'Отвечал за дизайн\nЯ запустил новую версию'
  const checks = reviewResume(resume, 'ru')
  expect(checks.find((c) => c.id === 'verbs')?.ok).toBe(false)
  expect(checks.find((c) => c.id === 'pronouns')?.ok).toBe(false)
})

it('flags placeholders, missing dates, and out-of-order jobs', () => {
  const resume = createDocument(true, 'en').versions.en
  resume.basics.summary = '[Job title] with [N] years of experience.'
  const older = { ...emptyEntry(), title: 'Intern', startDate: '2015-01' }
  resume.work.unshift(older, { ...emptyEntry(), title: 'Undated job' })
  const byId = Object.fromEntries(
    reviewResume(resume, 'en').map((c) => [c.id, c.ok]),
  )
  expect(byId.placeholders).toBe(false)
  expect(byId.dates).toBe(false)
  expect(byId.order).toBe(false)
})

it('splits vacancy terms into matched and missing without double counting', () => {
  const resume = createDocument(true, 'en').versions.en
  resume.skills = 'React, TypeScript, Figma'
  const result = matchJob(
    resume,
    'We need React.js and TypeScript, plus Node.js and GraphQL. C++ is a plus. Experience with dashboards and dashboards analytics.',
  )
  expect(result.matched).toEqual(expect.arrayContaining(['TypeScript']))
  expect(result.matched.some((t) => /^react/i.test(t))).toBe(true)
  expect(result.missing).toEqual(
    expect.arrayContaining(['Node.js', 'GraphQL', 'C++']),
  )
  expect(result.missing.some((t) => /^react/i.test(t))).toBe(false)
  expect(result.frequent.map((f) => f.term)).toContain('dashboards')
})

it('treats synonyms and plurals as the same skill', () => {
  const resume = createDocument(true, 'en').versions.en
  resume.skills = 'User research, Design systems, WCAG'
  const result = matchJob(
    resume,
    'Lead UX research, maintain our design system and improve accessibility. Research and testing every week; research matters.',
  )
  expect(result.missing).toEqual([])
  expect(result.matched).toEqual(
    expect.arrayContaining(['UX research', 'Design systems', 'Accessibility']),
  )
  expect(result.matched).not.toContain('User research')
  expect(result.frequent.map((f) => f.term.toLowerCase())).not.toContain(
    'research',
  )
})

it('keeps both built-in examples free of content warnings', () => {
  for (const locale of ['en', 'ru'] as const) {
    const failing = reviewResume(
      createDocument(true, locale).versions[locale],
      locale,
    ).filter((c) => !c.ok)
    expect(failing.map((c) => c.id)).toEqual([])
  }
})
