import {
  sectionLabels,
  type Locale,
  type ResumeDocument,
  type Section,
} from './model'
import { translator } from './i18n'
import { resumeLinkIssues } from './resume-links'
import { Disclosure } from './motion'

export default function PdfLinkWarnings({
  doc,
  locale,
  goSection,
  defaultOpen = true,
}: {
  doc: ResumeDocument
  locale: Locale
  goSection?: (section: Section) => void
  defaultOpen?: boolean
}) {
  const issues = resumeLinkIssues(doc)
  if (!issues.length) return null
  const t = translator(locale)
  return (
    <Disclosure
      className="pdf-link-warnings"
      defaultOpen={defaultOpen}
      summary={t(
        'Проверьте ссылки: {count}',
        'Link targets to check: {count}',
        {
          count: issues.length,
        },
      )}
    >
      <ul>
        {issues.map((issue, i) => (
          <li key={i}>
            <strong>{sectionLabels[locale][issue.section]}</strong>
            <span className="pdf-check-excerpt">{issue.value}</span>
            <p>
              {issue.kind === 'email'
                ? t(
                    'Укажите почту с @ и доменом. Сейчас адрес появится в PDF без ссылки.',
                    'Use an email with @ and a domain. This address will appear in the PDF without a link.',
                  )
                : t(
                    'Нужен адрес http или https, например example.com. Эта ссылка не попадёт в PDF.',
                    'Use an http or https address, like example.com. This link will be left out of the PDF.',
                  )}
            </p>
            {goSection && (
              <button
                className="text-button"
                onClick={() => goSection(issue.section)}
              >
                {t('Исправить в разделе «{section}»', 'Edit {section}', {
                  section: sectionLabels[locale][issue.section],
                })}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Disclosure>
  )
}
