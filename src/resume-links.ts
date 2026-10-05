import {
  safeEmailUrl,
  safeUrl,
  visibleSections,
  type ResumeDocument,
  type Section,
} from './model'

export type ResumeLinkIssue = {
  section: Section
  value: string
  kind: 'web' | 'email'
}

/** Only targets in the selected, visible PDF are relevant to a sharing copy. */
export function resumeLinkIssues(doc: ResumeDocument): ResumeLinkIssue[] {
  const r = doc.versions[doc.language]
  const issues: ResumeLinkIssue[] = []
  const web = (section: Section, value: string) => {
    if (value.trim() && !safeUrl(value))
      issues.push({ section, value, kind: 'web' })
  }
  if (r.basics.email.trim() && !safeEmailUrl(r.basics.email))
    issues.push({ section: 'basics', value: r.basics.email, kind: 'email' })
  for (const key of ['url', 'linkedin', 'github'] as const)
    web('basics', r.basics[key])
  for (const section of visibleSections(doc)) {
    if (section === 'summary' || section === 'skills') continue
    for (const entry of r[section])
      if (entry.title || entry.subtitle || entry.description)
        web(section, entry.url)
  }
  return issues.filter(
    (issue, index) =>
      issues.findIndex(
        (other) =>
          other.section === issue.section &&
          other.value === issue.value &&
          other.kind === issue.kind,
      ) === index,
  )
}
