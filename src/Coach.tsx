import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  Plus,
  Target,
} from 'lucide-react'
import {
  actionVerbs,
  guides,
  matchJob,
  reviewResume,
  type Check as ReviewCheck,
} from './writing'
import { sectionLabels, type Locale, type Resume, type Section } from './model'

export function WritingGuide({
  section,
  locale,
  onPattern,
  onVerb,
  verbTarget,
}: {
  section: Section
  locale: Locale
  onPattern?: (pattern: string) => void
  onVerb?: (verb: string) => void
  verbTarget?: string
}) {
  const guide = guides[section],
    ru = locale === 'ru',
    t = (a: string, b: string) => (ru ? a : b),
    [verbGroup, setVerbGroup] = useState(0),
    [open, setOpen] = useState(() => {
      try {
        return localStorage.getItem('cv-guide') !== 'closed'
      } catch {
        return true
      }
    })
  if (!guide) return null
  return (
    <details
      className="writing-guide"
      open={open}
      onToggle={(event) => {
        const next = (event.currentTarget as HTMLDetailsElement).open
        setOpen(next)
        try {
          localStorage.setItem('cv-guide', next ? 'open' : 'closed')
        } catch {
          /* The choice applies to this visit only. */
        }
      }}
    >
      <summary>
        {t('Как заполнить этот раздел', 'How to write this section')}
      </summary>
      <ul>
        {guide.rules.map((rule) => (
          <li key={rule.en}>{rule[locale]}</li>
        ))}
      </ul>
      {guide.before && guide.after && (
        <div className="guide-example">
          <p>
            <span className="guide-weak">{t('Было', 'Before')}</span>
            {guide.before[locale]}
          </p>
          <p>
            <span className="guide-strong">{t('Стало', 'After')}</span>
            {guide.after[locale]}
          </p>
        </div>
      )}
      {guide.pattern && (
        <div className="guide-pattern">
          <code>{guide.pattern[locale]}</code>
          {onPattern && (
            <button
              className="text-button"
              onClick={() => onPattern(guide.pattern![locale])}
            >
              <Plus size={14} />
              {t('Вставить структуру', 'Insert this structure')}
            </button>
          )}
        </div>
      )}
      {onVerb && (
        <div className="verb-library">
          <p>
            {verbTarget
              ? t(
                  `Начните новый пункт в «${verbTarget}»:`,
                  `Start a new point in “${verbTarget}”:`,
                )
              : t(
                  'Добавьте запись, чтобы вставлять глаголы:',
                  'Add an entry to insert verbs:',
                )}
          </p>
          <div
            className="verb-tabs"
            role="group"
            aria-label={t('Группы глаголов', 'Verb groups')}
          >
            {actionVerbs[locale].map((group, i) => (
              <button
                key={group.group}
                aria-pressed={verbGroup === i}
                onClick={() => setVerbGroup(i)}
              >
                {group.group}
              </button>
            ))}
          </div>
          <div className="verb-group">
            {actionVerbs[locale][verbGroup].verbs.map((verb) => (
              <button
                key={verb}
                disabled={!verbTarget}
                onClick={() => onVerb(verb)}
              >
                <Plus size={12} />
                {verb}
              </button>
            ))}
          </div>
        </div>
      )}
    </details>
  )
}

export function ReviewStep({
  resume,
  locale,
  goSection,
  addSkill,
  exportFile,
  exporting,
}: {
  resume: Resume
  locale: Locale
  goSection: (section: Section) => void
  addSkill: (skill: string) => void
  exportFile: () => void
  exporting: boolean
}) {
  const ru = locale === 'ru',
    t = (a: string, b: string) => (ru ? a : b),
    checks = reviewResume(resume, locale),
    passed = checks.filter((c) => c.ok).length,
    score = Math.round((passed / checks.length) * 100),
    [posting, setPosting] = useState(() => {
      try {
        return localStorage.getItem('cv-job-posting') || ''
      } catch {
        return ''
      }
    }),
    match = useMemo(
      () => (posting.trim().length > 40 ? matchJob(resume, posting) : null),
      [resume, posting],
    ),
    total = match ? match.matched.length + match.missing.length : 0
  useEffect(() => {
    try {
      localStorage.setItem('cv-job-posting', posting)
    } catch {
      /* The vacancy text stays for this visit. */
    }
  }, [posting])
  const failing = checks.filter((c) => !c.ok),
    groups: [string, ReviewCheck[]][] = [
      [t('Что улучшить', 'To improve'), failing],
      [t('Уже хорошо', 'Looking good'), checks.filter((c) => c.ok)],
    ]
  return (
    <div className="review-step">
      <div
        className="strength"
        style={{ '--score': `${score}%` } as React.CSSProperties}
      >
        <div className="strength-ring" aria-hidden="true">
          <strong>{score}</strong>
        </div>
        <div>
          <h2>
            {score >= 85
              ? t('Сильное резюме', 'A strong resume')
              : score >= 60
                ? t('Хорошая основа', 'A solid base')
                : t('Есть что усилить', 'Room to strengthen')}
          </h2>
          <p>
            {t(
              `Пройдено ${passed} из ${checks.length} проверок содержания. Это подсказки для читателя-человека и системы отбора, а не универсальный балл ATS.`,
              `${passed} of ${checks.length} content checks passed. These help human readers and screening systems; they are not a universal ATS score.`,
            )}
          </p>
        </div>
      </div>
      {groups.map(
        ([title, items]) =>
          items.length > 0 && (
            <section key={title} className="check-group">
              <h3>{title}</h3>
              <ul>
                {items.map((check) => (
                  <li key={check.id} className={check.ok ? 'ok' : 'todo'}>
                    {check.ok ? (
                      <Check size={16} aria-label={t('Готово', 'Done')} />
                    ) : (
                      <CircleAlert
                        size={16}
                        aria-label={t('Улучшить', 'Improve')}
                      />
                    )}
                    <div>
                      <strong>{check.title}</strong>
                      <span>{check.detail}</span>
                    </div>
                    {!check.ok && (
                      <button
                        className="text-button"
                        onClick={() => goSection(check.section)}
                      >
                        {sectionLabels[locale][check.section]}
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
      <section className="job-match">
        <h3>
          <Target size={17} />
          {t('Сверка с вакансией', 'Match a job posting')}
        </h3>
        <p>
          {t(
            'Вставьте текст вакансии — покажем, какие навыки и термины из неё уже есть в резюме, а каких нет. Всё считается в браузере.',
            'Paste a job posting to see which of its skills and terms your resume already covers. Everything runs in your browser.',
          )}
        </p>
        <textarea
          aria-label={t('Текст вакансии', 'Job posting text')}
          rows={6}
          maxLength={20000}
          value={posting}
          onChange={(e) => setPosting(e.target.value)}
          placeholder={t(
            'Вставьте описание вакансии…',
            'Paste the job description…',
          )}
        />
        {match && (
          <div className="match-result" aria-live="polite">
            {total > 0 ? (
              <p className="match-summary">
                <strong>
                  {match.matched.length} / {total}
                </strong>{' '}
                {t(
                  'ключевых навыков из вакансии есть в резюме.',
                  'key skills from the posting appear in your resume.',
                )}
              </p>
            ) : (
              <p className="match-summary">
                {t(
                  'Известных навыков не нашлось — посмотрите на частые слова ниже.',
                  'No known skills found — check the frequent terms below.',
                )}
              </p>
            )}
            {match.missing.length > 0 && (
              <>
                <h4>{t('Нет в резюме', 'Missing from your resume')}</h4>
                <p className="match-note">
                  {t(
                    'Добавьте только то, чем действительно владеете, — лучше и в навыки, и в пункт опыта.',
                    'Add only what you genuinely have — ideally in skills and in an experience point.',
                  )}
                </p>
                <div className="match-chips">
                  {match.missing.map((term) => (
                    <button
                      key={term}
                      className="chip missing"
                      onClick={() => addSkill(term)}
                      title={t('Добавить в навыки', 'Add to skills')}
                    >
                      <Plus size={13} />
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}
            {match.matched.length > 0 && (
              <>
                <h4>{t('Уже есть', 'Already covered')}</h4>
                <div className="match-chips">
                  {match.matched.map((term) => (
                    <span key={term} className="chip matched">
                      <Check size={13} />
                      {term}
                    </span>
                  ))}
                </div>
              </>
            )}
            {match.frequent.length > 0 && (
              <>
                <h4>{t('Часто в вакансии', 'Frequent in the posting')}</h4>
                <div className="match-chips">
                  {match.frequent.map(({ term, present }) => (
                    <span
                      key={term}
                      className={`chip ${present ? 'matched' : 'neutral'}`}
                    >
                      {present && <Check size={13} />}
                      {term}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
      <div className="review-finish">
        <div>
          <strong>{t('Готово к отправке?', 'Ready to send?')}</strong>
          <span>
            {t(
              'Скачайте PDF и проверьте, что текст копируется, а ссылки открываются.',
              'Download the PDF, then check that text copies and links open.',
            )}
          </span>
        </div>
        <button
          className="button primary"
          onClick={exportFile}
          disabled={exporting}
        >
          <Download size={16} />
          {t('Скачать PDF', 'Download PDF')}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
