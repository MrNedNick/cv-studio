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
  verbGroups,
  guides,
  matchJob,
  reviewResume,
  type Check as ReviewCheck,
} from './writing'
import { Disclosure } from './motion'
import { sectionLabels, type Locale, type Resume, type Section } from './model'
import { translate, translator } from './i18n'

export function WritingGuide({
  section,
  locale,
  lang = locale,
  onPattern,
  onVerb,
  verbTarget,
}: {
  section: Section
  locale: Locale
  /** Language of the resume version: verbs and inserted structures use it. */
  lang?: Locale
  onPattern?: (pattern: string) => void
  onVerb?: (verb: string) => void
  verbTarget?: string
}) {
  const guide = guides[section],
    t = translator(locale),
    pattern =
      guide?.pattern && translate(lang, guide.pattern.ru, guide.pattern.en),
    [verbGroup, setVerbGroup] = useState(0),
    [open, setOpen] = useState(() => {
      try {
        return localStorage.getItem('cv-guide') === 'open'
      } catch {
        return false
      }
    })
  if (!guide) return null
  return (
    <Disclosure
      className="writing-guide"
      open={open}
      onToggle={(next) => {
        setOpen(next)
        try {
          localStorage.setItem('cv-guide', next ? 'open' : 'closed')
        } catch {
          /* The choice applies to this visit only. */
        }
      }}
      summary={t('Как заполнить этот раздел', 'How to write this section')}
    >
      <ul>
        {guide.rules.map((rule) => (
          <li key={rule.en}>{t(rule.ru, rule.en)}</li>
        ))}
      </ul>
      {guide.before && guide.after && (
        <div className="guide-example">
          <p>
            <span className="guide-weak">{t('Было', 'Before')}</span>
            {t(guide.before.ru, guide.before.en)}
          </p>
          <p>
            <span className="guide-strong">{t('Стало', 'After')}</span>
            {t(guide.after.ru, guide.after.en)}
          </p>
        </div>
      )}
      {pattern && (
        <div className="guide-pattern">
          <code lang={lang}>{pattern}</code>
          {onPattern && (
            <button className="text-button" onClick={() => onPattern(pattern)}>
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
                  'Начните новый пункт в «{entry}»:',
                  'Start a new point in “{entry}”:',
                  { entry: verbTarget },
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
            {verbGroups.map((group, i) => (
              <button
                key={group.en}
                aria-pressed={verbGroup === i}
                onClick={() => setVerbGroup(i)}
              >
                {t(group.ru, group.en)}
              </button>
            ))}
          </div>
          <div className="verb-group" lang={lang}>
            {actionVerbs[lang][verbGroup].map((verb) => (
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
    </Disclosure>
  )
}

export function ReviewStep({
  resume,
  locale,
  lang = locale,
  goSection,
  addSkill,
  exportFile,
  exporting,
}: {
  resume: Resume
  locale: Locale
  lang?: Locale
  goSection: (section: Section) => void
  addSkill: (skill: string) => void
  exportFile: () => void
  exporting: boolean
}) {
  const t = translator(locale),
    checks = reviewResume(resume, locale, lang),
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
    passedChecks = checks.filter((c) => c.ok)
  const list = (items: ReviewCheck[]) => (
    <ul>
      {items.map((check) => (
        <li key={check.id} className={check.ok ? 'ok' : 'todo'}>
          {check.ok ? (
            <Check size={16} aria-label={t('Готово', 'Done')} />
          ) : (
            <CircleAlert size={16} aria-label={t('Улучшить', 'Improve')} />
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
  )
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
              'Пройдено {passed} из {total} проверок содержания. Это подсказки для читателя-человека и системы отбора, а не универсальный балл ATS.',
              '{passed} of {total} content checks passed. These help human readers and screening systems; they are not a universal ATS score.',
              { passed, total: checks.length },
            )}
          </p>
        </div>
      </div>
      {failing.length > 0 && (
        <section className="check-group">
          <h3>{t('Что улучшить', 'To improve')}</h3>
          {list(failing)}
        </section>
      )}
      {passedChecks.length > 0 && (
        <Disclosure
          className="check-group passed-checks"
          summary={t('Уже хорошо · {count}', 'Looking good · {count}', {
            count: passedChecks.length,
          })}
        >
          {list(passedChecks)}
        </Disclosure>
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
