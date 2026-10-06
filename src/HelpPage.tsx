import { translator } from './i18n'
import type { Locale } from './model'
import { Faq } from './Faq'
export function HelpContent({ locale }: { locale: Locale }) {
  const t = translator(locale)
  return (
    <div className="help-content">
      <p>
        <strong>{t('Быстрые действия.', 'Keyboard shortcuts.')}</strong>{' '}
        {t(
          'Ctrl / ⌘ Z — отменить; Ctrl / ⌘ Shift Z — повторить; Ctrl / ⌘ S — сохранить JSON-копию.',
          'Ctrl / ⌘ Z to undo; Ctrl / ⌘ Shift Z to redo; Ctrl / ⌘ S to save a JSON backup.',
        )}
      </p>
      <p>
        <strong>
          {t(
            'Бесплатно от первого слова до PDF.',
            'Free from the first word to the final PDF.',
          )}
        </strong>{' '}
        {t(
          'Все шаблоны, скачивание и редактирование доступны без регистрации, подписок и водяных знаков.',
          'All templates, downloads, and editing are available without sign-up, subscriptions, or watermarks.',
        )}
      </p>
      <p>
        <strong>
          {t('Данные остаются у вас.', 'Your data stays with you.')}
        </strong>{' '}
        {t(
          'Резюме сохраняется только в этом браузере. Очистка данных браузера удалит локальную копию — сохраняйте редактируемый PDF или JSON.',
          'Your resume is stored only in this browser. Clearing browser data removes the local copy, so keep an editable PDF or JSON backup.',
        )}
      </p>
      <p>
        <strong>
          {t(
            'Редактируемую копию можно открыть снова.',
            'Editable copies can be reopened.',
          )}
        </strong>{' '}
        {t(
          'При скачивании выберите «Редактируемая копия», чтобы сохранить все языковые версии и оформление внутри PDF. Такая копия восстанавливается через «Открыть файл». Вариант «Для отправки» содержит только выбранный язык и не открывается для редактирования.',
          'Choose “Editable copy” when downloading to include every language version and the design settings. Use “Open file” to restore that copy. “For sharing” contains only the selected language and cannot be reopened for editing.',
        )}
      </p>
      <p>
        <strong>EN · RU · DE · ES · BG · UK.</strong>{' '}
        {t(
          'Выберите язык вверху страницы для интерфейса и резюме. У каждого языка свой текст — вы переводите его самостоятельно. Контакты, даты и ссылки общие. В PDF попадает выбранный язык.',
          'Choose a language at the top of the page for both the interface and the resume. Each language keeps its own text; you translate it yourself. Contacts, dates and links are shared. The PDF contains the selected language.',
        )}
      </p>
    </div>
  )
}
export function HelpPage({ locale }: { locale: Locale }) {
  const t = translator(locale)
  return (
    <div className="help-page">
      <h1>{t('Как работает NeatCV', 'How NeatCV works')}</h1>
      <HelpContent locale={locale} />
      <Faq locale={locale} expanded />
      <a className="button primary" href="/#/edit">
        {t('Открыть редактор', 'Open the editor')}
      </a>
    </div>
  )
}
