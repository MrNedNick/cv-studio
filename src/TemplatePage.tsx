import { ArrowRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { MiniResume, templates } from './components'
import { translator } from './i18n'
import type { Locale, Template } from './model'
import { Faq } from './Faq'

export function TemplateLinks({ locale }: { locale: Locale }) {
  const t = translator(locale)
  return (
    <nav
      className="template-links"
      aria-label={t('Описание шаблонов', 'Template details')}
    >
      {templates.map((item) => (
        <a href={`/templates/${item.id}/`} key={item.id}>
          {t('О шаблоне {template}', 'About {template}', {
            template: item.name,
          })}
          <ArrowRight size={16} />
        </a>
      ))}
    </nav>
  )
}

export default function TemplatePage({
  locale,
  ready,
  onPick,
}: {
  locale: Locale
  ready: boolean
  onPick: (template: Template) => void
}) {
  const { id } = useParams(),
    item = templates.find((template) => template.id === id),
    t = translator(locale)
  if (!item)
    return (
      <p>
        <a href="/templates/">{t('Все шаблоны', 'Explore templates')}</a>
      </p>
    )
  return (
    <div className="template-page">
      <a className="text-button" href="/templates/">
        {t('Все шаблоны', 'Explore templates')}
      </a>
      <div className="template-detail-grid">
        <div>
          <div className="eyebrow">
            {t('ВСЕ ШАБЛОНЫ БЕСПЛАТНЫ', 'EVERY TEMPLATE IS FREE')}
          </div>
          <h1>{item.name}</h1>
          <p className="template-lead">{t(item.ru, item.en)}</p>
          <p>
            {t(
              'Выберите оформление под свой опыт. В редакторе можно настроить цвет, размер текста, плотность и порядок разделов. Шаблон меняется без повторного заполнения.',
              'Choose a design for your experience. In the editor you can adjust color, text size, spacing and section order. Switch designs without filling everything in again.',
            )}
          </p>
          {item.id === 'sidebar' && (
            <p className="gallery-note">
              {t(
                'У этого шаблона две колонки. Перед откликом проверьте порядок извлечённого текста в просмотре PDF.',
                'This template has two columns. Check the extracted PDF reading order before applying.',
              )}
            </p>
          )}
          <button
            className="button primary"
            disabled={!ready}
            onClick={() => onPick(item.id)}
          >
            {t('Использовать шаблон {template}', 'Use {template} template', {
              template: item.name,
            })}
            <ArrowRight size={18} />
          </button>
          <p>
            {t(
              'Без регистрации. Бесплатный PDF без водяных знаков.',
              'No sign-up. Free PDF without watermarks.',
            )}
          </p>
        </div>
        <div className="template-detail-preview">
          <MiniResume template={item.id} locale={locale} large />
          <p>
            {t(
              'Пример оформления. Настоящий PDF появится в редакторе с вашим текстом.',
              'Illustrative preview. The editor shows the actual PDF with your text.',
            )}
          </p>
        </div>
      </div>
      <Faq locale={locale} expanded />
      <TemplateLinks locale={locale} />
    </div>
  )
}
