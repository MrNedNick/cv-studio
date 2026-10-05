import { Fragment } from 'react'
import {
  dateRange,
  safeUrl,
  safeEmailUrl,
  sectionLabels,
  visibleSections,
  type EntrySection,
  type Locale,
  type ResumeDocument,
} from './model'
import { translator } from './i18n'

export default function ResumeText({
  doc,
  locale = doc.language,
}: {
  doc: ResumeDocument
  locale?: Locale
}) {
  const t = translator(locale),
    tc = translator(doc.language)
  const resume = doc.versions[doc.language],
    labels = sectionLabels[doc.language]
  function entries(section: EntrySection) {
    const visible = resume[section].filter(
      (entry) =>
        entry.title.trim() || entry.subtitle.trim() || entry.description.trim(),
    )
    return (
      visible.length > 0 && (
        <section key={section}>
          <h3>{labels[section]}</h3>
          {visible.map((entry) => (
            <div className="resume-text-entry" key={entry.id}>
              {entry.title && <h4>{entry.title}</h4>}
              {entry.subtitle && <p>{entry.subtitle}</p>}
              {section !== 'languages' && dateRange(entry, doc.language) && (
                <p>{dateRange(entry, doc.language)}</p>
              )}
              {entry.description &&
                (section === 'work' ? (
                  <ul>
                    {entry.description
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="preserve-lines">{entry.description}</p>
                ))}
              {entry.url && safeUrl(entry.url) && (
                <a href={safeUrl(entry.url)} target="_blank" rel="noreferrer">
                  {entry.url}
                </a>
              )}
            </div>
          ))}
        </section>
      )
    )
  }
  const skills = resume.skills.trim() && (
    <section>
      <h3>{labels.skills}</h3>
      <p>
        {resume.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(' · ')}
      </p>
    </section>
  )
  return (
    <article
      className="resume-text"
      aria-label={t('Текст резюме', 'Resume text')}
      lang={doc.language}
    >
      <h2>{resume.basics.name || tc('Ваше имя', 'Your name')}</h2>
      {resume.basics.label && (
        <p className="resume-text-role">{resume.basics.label}</p>
      )}
      <div className="resume-text-contacts">
        {resume.basics.location && <p>{resume.basics.location}</p>}
        {resume.basics.email &&
          (safeEmailUrl(resume.basics.email) ? (
            <a href={safeEmailUrl(resume.basics.email)}>
              {resume.basics.email}
            </a>
          ) : (
            <p>{resume.basics.email}</p>
          ))}
        {resume.basics.phone && <p>{resume.basics.phone}</p>}
        {(['url', 'linkedin', 'github'] as const).map(
          (key) =>
            resume.basics[key] &&
            safeUrl(resume.basics[key]) && (
              <a
                key={key}
                href={safeUrl(resume.basics[key])}
                target="_blank"
                rel="noreferrer"
              >
                {resume.basics[key]}
              </a>
            ),
        )}
      </div>
      {visibleSections(doc).map((section) =>
        section === 'summary'
          ? resume.basics.summary.trim() && (
              <section key="summary">
                <h3>{labels.summary}</h3>
                <p className="preserve-lines">{resume.basics.summary}</p>
              </section>
            )
          : section === 'skills'
            ? skills && <Fragment key="skills">{skills}</Fragment>
            : entries(section),
      )}
    </article>
  )
}
