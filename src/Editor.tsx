import { lazy, Suspense, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe2,
  GraduationCap,
  LayoutTemplate,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  Plus,
  Redo2,
  ShieldCheck,
  Trash2,
  Undo2,
  Upload,
  UserRound,
  X,
  BriefcaseBusiness,
  FolderOpen,
  PenLine,
  LoaderCircle,
} from 'lucide-react'
import { Field } from './ui/components/field/field'
import {
  accents,
  emptyEntry,
  getTips,
  sectionLabels,
  sections,
  type EntrySection,
  type Locale,
  type Resume,
  type Section,
  type StudioDocument,
} from './model'
import { MiniResume, FormField, templates } from './components'
const Preview = lazy(() => import('./Preview'))
const icons = {
  basics: UserRound,
  summary: PenLine,
  work: BriefcaseBusiness,
  education: GraduationCap,
  skills: ListChecks,
  projects: FolderOpen,
  languages: Globe2,
}
interface EditorProps {
  doc: StudioDocument
  locale: Locale
  update: (doc: StudioDocument, group?: boolean) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveState: string
  exporting: boolean
  exportFile: () => void
  openFile: () => void
  start: () => void
  backup: () => void
}
export default function Editor({
  doc,
  locale,
  update,
  undo,
  redo,
  canUndo,
  canRedo,
  saveState,
  exporting,
  exportFile,
  openFile,
  start,
  backup,
}: EditorProps) {
  const [section, setSection] = useState<Section>('basics'),
    [tab, setTab] = useState<'content' | 'design'>('content'),
    [mobilePreview, setMobilePreview] = useState(false),
    [menu, setMenu] = useState(false),
    [hiddenTips, setHiddenTips] = useState<string[]>([])
  const ru = locale === 'ru',
    t = (a: string, b: string) => (ru ? a : b),
    resume = doc.versions[locale],
    other = locale === 'ru' ? 'en' : 'ru',
    labels = sectionLabels[locale],
    tips = getTips(resume, locale).filter((tip) => !hiddenTips.includes(tip)),
    completed = sections.filter((s) =>
      s === 'basics'
        ? resume.basics.name.trim()
        : s === 'summary'
          ? resume.basics.summary.trim()
          : s === 'skills'
            ? resume.skills.trim()
            : resume[s].length > 0,
    ).length
  function basic(key: keyof Resume['basics'], value: string) {
    const versions = {
      ...doc.versions,
      [locale]: { ...resume, basics: { ...resume.basics, [key]: value } },
    }
    if (['email', 'phone', 'url'].includes(key))
      versions[other] = {
        ...versions[other],
        basics: { ...versions[other].basics, [key]: value },
      }
    update({ ...doc, versions }, true)
  }
  function entry(
    section: EntrySection,
    id: string,
    key: string,
    value: string | boolean,
  ) {
    const versions = {
      ...doc.versions,
      [locale]: {
        ...resume,
        [section]: resume[section].map((e) =>
          e.id === id ? { ...e, [key]: value } : e,
        ),
      },
    }
    if (['startDate', 'endDate', 'current', 'url'].includes(key))
      versions[other] = {
        ...versions[other],
        [section]: versions[other][section].map((e) =>
          e.id === id ? { ...e, [key]: value } : e,
        ),
      }
    update({ ...doc, versions }, true)
  }
  function add(section: EntrySection) {
    const e = emptyEntry()
    update({
      ...doc,
      versions: {
        ...doc.versions,
        [locale]: { ...resume, [section]: [...resume[section], e] },
        [other]: {
          ...doc.versions[other],
          [section]: [...doc.versions[other][section], { ...e }],
        },
      },
    })
  }
  function remove(section: EntrySection, id: string) {
    update({
      ...doc,
      versions: {
        ...doc.versions,
        [locale]: {
          ...resume,
          [section]: resume[section].filter((e) => e.id !== id),
        },
        [other]: {
          ...doc.versions[other],
          [section]: doc.versions[other][section].filter((e) => e.id !== id),
        },
      },
    })
  }
  function move(section: EntrySection, index: number, direction: number) {
    const entries = [...resume[section]]
    ;[entries[index], entries[index + direction]] = [
      entries[index + direction],
      entries[index],
    ]
    update({
      ...doc,
      versions: {
        ...doc.versions,
        [locale]: { ...resume, [section]: entries },
      },
    })
  }
  const subtitles: Record<Section, string> = {
    basics: t(
      'Начните с главного: как вас зовут и чем вы занимаетесь.',
      'Start with the essentials: who you are and what you do.',
    ),
    summary: t(
      'Несколько предложений о вашем опыте и сильных сторонах.',
      'A few focused sentences about your experience and strengths.',
    ),
    work: t(
      'Начните с последнего места работы. Расскажите о результатах.',
      'Start with your most recent role. Focus on what you achieved.',
    ),
    education: t(
      'Укажите образование и значимые курсы.',
      'Add your education and relevant courses.',
    ),
    skills: t(
      'Добавьте навыки, которые важны для вашей следующей роли.',
      'Include the skills that matter for your next role.',
    ),
    projects: t(
      'Покажите работу, которой вы гордитесь.',
      'Show work you’re proud of.',
    ),
    languages: t(
      'Укажите языки и уровень владения.',
      'List the languages you speak and your proficiency.',
    ),
  }
  return (
    <div className="editor">
      <div className="editor-toolbar">
        <div className="document-title">
          <FileText size={20} />
          <div>
            <strong>
              {resume.basics.name || t('Моё резюме', 'My resume')}
            </strong>
            <span>
              <span className={`save-dot ${saveState}`} />
              {saveState === 'saved'
                ? t('Сохранено в браузере', 'Saved in this browser')
                : saveState === 'saving'
                  ? t('Сохраняем…', 'Saving…')
                  : t('Не сохранено', 'Not saved')}
            </span>
          </div>
        </div>
        <div className="editor-actions">
          <div className="history-actions">
            <button
              className="icon-button"
              onClick={undo}
              disabled={!canUndo}
              aria-label={t('Отменить', 'Undo')}
              title={t('Отменить', 'Undo')}
            >
              <Undo2 size={18} />
            </button>
            <button
              className="icon-button"
              onClick={redo}
              disabled={!canRedo}
              aria-label={t('Повторить', 'Redo')}
              title={t('Повторить', 'Redo')}
            >
              <Redo2 size={18} />
            </button>
          </div>
          <button className="button secondary open-file" onClick={openFile}>
            <Upload size={16} />
            {t('Открыть файл', 'Open file')}
          </button>
          <button
            className="button primary export-button"
            onClick={exportFile}
            disabled={exporting}
          >
            {exporting ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Download size={17} />
            )}
            {exporting
              ? t('Готовим PDF…', 'Preparing…')
              : t('Скачать PDF', 'Download PDF')}
          </button>
          <button
            className="icon-button"
            aria-label={t('Действия с резюме', 'Resume actions')}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      {menu && (
        <div className="document-menu">
          <button
            onClick={() => {
              backup()
              setMenu(false)
            }}
          >
            <Download size={16} />
            {t('Сохранить JSON-копию', 'Save JSON backup')}
          </button>
          <button
            onClick={() => {
              openFile()
              setMenu(false)
            }}
          >
            <Upload size={16} />
            {t('Открыть PDF / JSON', 'Open PDF / JSON')}
          </button>
          <button
            onClick={() => {
              start()
              setMenu(false)
            }}
          >
            <Plus size={16} />
            {t('Новое резюме', 'New resume')}
          </button>
        </div>
      )}
      <div className="mobile-view-switch">
        <button
          className={!mobilePreview ? 'active' : ''}
          onClick={() => setMobilePreview(false)}
        >
          <PenLine size={16} />
          {t('Редактор', 'Editor')}
        </button>
        <button
          className={mobilePreview ? 'active' : ''}
          onClick={() => setMobilePreview(true)}
        >
          <Eye size={16} />
          {t('Просмотр', 'Preview')}
        </button>
      </div>
      <div className={`editor-body ${mobilePreview ? 'show-preview' : ''}`}>
        <aside className="editor-sidebar">
          <div className="sidebar-title">{t('ВАШЕ РЕЗЮМЕ', 'YOUR RESUME')}</div>
          <div className="editor-mode">
            <button
              className={tab === 'content' ? 'active' : ''}
              onClick={() => setTab('content')}
            >
              <PenLine size={15} />
              {t('Текст', 'Content')}
            </button>
            <button
              className={tab === 'design' ? 'active' : ''}
              onClick={() => setTab('design')}
            >
              <LayoutTemplate size={15} />
              {t('Дизайн', 'Design')}
            </button>
          </div>
          <div className="section-nav">
            {sections.map((s, i) => {
              const Icon = icons[s]
              return (
                <button
                  key={s}
                  className={section === s && tab === 'content' ? 'active' : ''}
                  onClick={() => {
                    setSection(s)
                    setTab('content')
                  }}
                >
                  <Icon size={17} />
                  <span>{labels[s]}</span>
                  <small>0{i + 1}</small>
                </button>
              )
            })}
          </div>
          <div className="sidebar-bottom">
            <div className="completion">
              <span>{t('Заполнено разделов', 'Sections filled')}</span>
              <strong>{completed} / 7</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(completed / 7) * 100}%` }} />
            </div>
            <p>
              {t(
                'Оставьте только то, что важно для вашей следующей работы.',
                'Include what matters for your next opportunity.',
              )}
            </p>
            <div className="local-badge">
              <ShieldCheck size={16} />
              {t('Только на вашем устройстве', 'Only on your device')}
            </div>
          </div>
        </aside>
        <section className="editor-form">
          {tab === 'design' ? (
            <>
              <div className="eyebrow">{t('ВАШ СТИЛЬ', 'MAKE IT YOURS')}</div>
              <h1>{t('Оформление', 'Design')}</h1>
              <p className="form-description">
                {t(
                  'Попробуйте разные варианты. Текст останется на месте.',
                  'Try different looks. Your content stays the same.',
                )}
              </p>
              <div className="design-options">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={doc.template === template.id ? 'selected' : ''}
                    onClick={() => update({ ...doc, template: template.id })}
                  >
                    <MiniResume template={template.id} locale={locale} />
                    <div>
                      <strong>{template.name}</strong>
                      {doc.template === template.id && <Check size={16} />}
                    </div>
                    <span>{template[locale]}</span>
                  </button>
                ))}
              </div>
              {doc.template === 'sidebar' && (
                <p className="inline-tip">
                  {t(
                    'Для автоматического отбора лучше выбрать одноколоночный шаблон.',
                    'A single-column template is a safer choice for automated screening.',
                  )}
                </p>
              )}
              <h2 className="control-heading">
                {t('Цвет акцента', 'Accent color')}
              </h2>
              <div className="color-options">
                {accents.map((color, i) => (
                  <button
                    key={color}
                    aria-label={t(
                      ['Лесной', 'Синий', 'Бордовый', 'Фиолетовый', 'Графит'][
                        i
                      ],
                      ['Forest', 'Blue', 'Burgundy', 'Purple', 'Graphite'][i],
                    )}
                    aria-pressed={doc.accent === color}
                    style={{ background: color }}
                    onClick={() => update({ ...doc, accent: color })}
                  >
                    {doc.accent === color && <Check size={18} />}
                  </button>
                ))}
              </div>
              {doc.template === 'classic' && (
                <p className="field-hint">
                  {t(
                    'Classic использует строгую монохромную палитру.',
                    'Classic uses a timeless monochrome palette.',
                  )}
                </p>
              )}
              <Field
                className="field"
                label={t('Плотность текста', 'Text density')}
              >
                <select
                  value={doc.density}
                  onChange={(e) =>
                    update({
                      ...doc,
                      density: e.target.value as StudioDocument['density'],
                    })
                  }
                >
                  <option value="comfortable">
                    {t('Свободнее', 'Comfortable')}
                  </option>
                  <option value="compact">{t('Компактнее', 'Compact')}</option>
                </select>
              </Field>
            </>
          ) : (
            <>
              <div className="form-step">
                <div className="eyebrow">
                  {t('РАЗДЕЛ', 'SECTION')} 0{sections.indexOf(section) + 1} / 07
                </div>
                <span className="locale-badge">{locale.toUpperCase()}</span>
              </div>
              <h1>{labels[section]}</h1>
              <p className="form-description">{subtitles[section]}</p>
              {section === 'basics' ? (
                <>
                  <FormField
                    label={t('Имя и фамилия', 'Full name')}
                    value={resume.basics.name}
                    onChange={(v) => basic('name', v)}
                    placeholder={t('Как к вам обращаться?', 'Your full name')}
                  />
                  <FormField
                    label={t(
                      'Должность или специализация',
                      'Job title or speciality',
                    )}
                    value={resume.basics.label}
                    onChange={(v) => basic('label', v)}
                    placeholder={t(
                      'Например, продуктовый дизайнер',
                      'e.g. Product designer',
                    )}
                  />
                  <div className="form-divider">
                    {t('КОНТАКТЫ', 'CONTACT DETAILS')}
                  </div>
                  <div className="field-row">
                    <FormField
                      label={t('Электронная почта', 'Email')}
                      value={resume.basics.email}
                      onChange={(v) => basic('email', v)}
                      type="email"
                      placeholder="you@example.com"
                    />
                    <FormField
                      label={t('Телефон', 'Phone')}
                      value={resume.basics.phone}
                      onChange={(v) => basic('phone', v)}
                      type="tel"
                      placeholder="+420 …"
                    />
                  </div>
                  <FormField
                    label={t('Город и страна', 'City and country')}
                    value={resume.basics.location}
                    onChange={(v) => basic('location', v)}
                    placeholder={t(
                      'Например, Прага, Чехия',
                      'e.g. Prague, Czechia',
                    )}
                  />
                  <FormField
                    label={t(
                      'Сайт, портфолио или LinkedIn',
                      'Website, portfolio, or LinkedIn',
                    )}
                    value={resume.basics.url}
                    onChange={(v) => basic('url', v)}
                    placeholder="https://…"
                    hint={t(
                      'Необязательные поля можно оставить пустыми — они не попадут в PDF.',
                      'Leave optional fields blank — they won’t appear in your PDF.',
                    )}
                  />
                </>
              ) : section === 'summary' ? (
                <FormField
                  label={t('Коротко о вас', 'Your professional profile')}
                  value={resume.basics.summary}
                  onChange={(v) => basic('summary', v)}
                  multiline
                  placeholder={t(
                    'Что вы умеете, какой у вас опыт и какую пользу приносите?',
                    'What do you do well, and what value do you bring?',
                  )}
                  hint={t(
                    '2–4 предложения. Пишите конкретно, без общих фраз.',
                    'Aim for 2–4 specific sentences. Skip generic buzzwords.',
                  )}
                />
              ) : section === 'skills' ? (
                <>
                  <FormField
                    label={t('Ваши навыки', 'Your skills')}
                    value={resume.skills}
                    onChange={(v) =>
                      update(
                        {
                          ...doc,
                          versions: {
                            ...doc.versions,
                            [locale]: { ...resume, skills: v },
                          },
                        },
                        true,
                      )
                    }
                    multiline
                    placeholder="Figma, HTML, CSS, …"
                    hint={t(
                      'Разделяйте навыки запятыми.',
                      'Separate skills with commas.',
                    )}
                  />
                  <div className="skill-chips">
                    {resume.skills
                      .split(',')
                      .filter((s) => s.trim())
                      .map((s, i) => (
                        <span key={i}>{s.trim()}</span>
                      ))}
                  </div>
                </>
              ) : (
                <>
                  {resume[section].map((e, i) => (
                    <div className="entry-card" key={e.id}>
                      <div className="entry-header">
                        <strong>
                          {e.title || `${labels[section]} ${i + 1}`}
                        </strong>
                        <div>
                          <button
                            className="icon-button"
                            disabled={i === 0}
                            aria-label={t('Поднять', 'Move up')}
                            onClick={() => move(section, i, -1)}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            className="icon-button"
                            disabled={i === resume[section].length - 1}
                            aria-label={t('Опустить', 'Move down')}
                            onClick={() => move(section, i, 1)}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            className="icon-button delete"
                            aria-label={t('Удалить запись', 'Remove entry')}
                            onClick={() => remove(section, e.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <FormField
                        label={
                          section === 'work'
                            ? t('Должность', 'Job title')
                            : section === 'education'
                              ? t(
                                  'Специальность / степень',
                                  'Degree / field of study',
                                )
                              : section === 'languages'
                                ? t('Язык', 'Language')
                                : t('Название проекта', 'Project name')
                        }
                        value={e.title}
                        onChange={(v) => entry(section, e.id, 'title', v)}
                      />
                      <FormField
                        label={
                          section === 'work'
                            ? t('Компания', 'Company')
                            : section === 'education'
                              ? t('Учебное заведение', 'Institution')
                              : section === 'languages'
                                ? t('Уровень владения', 'Proficiency')
                                : t('Роль / организация', 'Role / organization')
                        }
                        value={e.subtitle}
                        onChange={(v) => entry(section, e.id, 'subtitle', v)}
                      />
                      {section !== 'languages' && (
                        <>
                          <div className="field-row">
                            <FormField
                              label={t('Начало', 'Start date')}
                              type="month"
                              value={e.startDate}
                              onChange={(v) =>
                                entry(section, e.id, 'startDate', v)
                              }
                            />
                            {!e.current && (
                              <FormField
                                label={t('Окончание', 'End date')}
                                type="month"
                                value={e.endDate}
                                onChange={(v) =>
                                  entry(section, e.id, 'endDate', v)
                                }
                              />
                            )}
                          </div>
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              checked={e.current}
                              onChange={(event) =>
                                entry(
                                  section,
                                  e.id,
                                  'current',
                                  event.target.checked,
                                )
                              }
                            />
                            {t('По настоящее время', 'Present')}
                          </label>
                          <FormField
                            label={
                              section === 'work'
                                ? t(
                                    'Результаты и достижения',
                                    'Achievements and impact',
                                  )
                                : t('Описание', 'Description')
                            }
                            multiline
                            value={e.description}
                            onChange={(v) =>
                              entry(section, e.id, 'description', v)
                            }
                            hint={
                              section === 'work'
                                ? t(
                                    'Каждая новая строка — отдельный пункт. Добавьте результаты в цифрах.',
                                    'One achievement per line. Include measurable results.',
                                  )
                                : undefined
                            }
                          />
                          {section === 'projects' && (
                            <FormField
                              label={t('Ссылка на проект', 'Project link')}
                              value={e.url}
                              onChange={(v) => entry(section, e.id, 'url', v)}
                              placeholder="https://…"
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {resume[section].length === 0 && (
                    <div className="empty-section">
                      <Plus size={24} />
                      <p>{t('Здесь пока пусто', 'Nothing here yet')}</p>
                      <span>
                        {t(
                          'Добавьте запись или пропустите раздел.',
                          'Add an entry, or skip this section.',
                        )}
                      </span>
                    </div>
                  )}
                  <button
                    className="button add-entry"
                    onClick={() => add(section)}
                  >
                    <Plus size={17} />
                    {t('Добавить запись', 'Add entry')}
                  </button>
                  <p className="field-hint">
                    {t(
                      'Удаление и изменения можно отменить стрелкой вверху.',
                      'Use Undo above to restore removed entries or changes.',
                    )}
                  </p>
                </>
              )}
              {tips.length > 0 && (
                <div className="tips">
                  <div>
                    <Lightbulb size={17} />
                    <strong>
                      {t('Небольшая подсказка', 'A little guidance')}
                    </strong>
                  </div>
                  {tips.map((tip) => (
                    <p key={tip}>
                      {tip}
                      <button
                        aria-label={t('Скрыть подсказку', 'Dismiss tip')}
                        onClick={() => setHiddenTips([...hiddenTips, tip])}
                      >
                        <X size={14} />
                      </button>
                    </p>
                  ))}
                </div>
              )}
              <div className="form-bottom">
                <span>
                  {t(
                    'Пустые разделы не попадут в PDF',
                    'Empty sections stay out of your PDF',
                  )}
                </span>
                <button
                  className="button secondary"
                  onClick={() =>
                    sections.indexOf(section) < 6
                      ? setSection(sections[sections.indexOf(section) + 1])
                      : setTab('design')
                  }
                >
                  {sections.indexOf(section) < 6
                    ? t('Далее', 'Next')
                    : t('К оформлению', 'Choose a design')}
                  <ChevronRight size={16} />
                </button>
              </div>
              <p className="translation-note">
                <Globe2 size={14} />
                {t(
                  'RU / EN вверху переключает версии. Перевод заполняется вручную.',
                  'RU / EN above switches versions. Translations are entered manually.',
                )}
              </p>
            </>
          )}
        </section>
        <section
          className="preview-panel"
          aria-label={t('Предпросмотр резюме', 'Resume preview')}
        >
          <div className="preview-heading">
            <span>
              <Eye size={16} />
              {t('Живой просмотр', 'Live preview')}
            </span>
            <span>
              {templates.find((v) => v.id === doc.template)?.name}
              <span className="preview-tag">PDF</span>
            </span>
          </div>
          <Suspense
            fallback={
              <div className="loading">
                <LoaderCircle className="spin" />
                {t('Готовим просмотр…', 'Preparing preview…')}
              </div>
            }
          >
            <Preview doc={doc} />
          </Suspense>
          <div className="preview-footnote">
            <LockKeyhole size={13} />
            {t(
              'Без водяных знаков. Без оплаты за скачивание.',
              'No watermarks. No paywall at download.',
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
