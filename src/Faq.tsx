import { translator } from './i18n'
import type { Locale } from './model'
import { Disclosure } from './motion'

export const faq = [
  {
    question: {
      ru: 'Скачивание PDF действительно бесплатное?',
      en: 'Is PDF download really free?',
    },
    answer: {
      ru: 'Да. Все двенадцать шаблонов, редактирование и оба варианта PDF бесплатны. Регистрация, подписка и водяные знаки не нужны.',
      en: 'Yes. All twelve templates, editing and both PDF options are free. No registration, subscription or watermarks are required.',
    },
  },
  {
    question: {
      ru: 'Где хранится моё резюме?',
      en: 'Where is my resume stored?',
    },
    answer: {
      ru: 'В этом браузере, на вашем устройстве. NeatCV не загружает текст, фото или файлы резюме на сервер. Очистка данных сайта удалит локальную копию — заранее скачайте резервную.',
      en: 'In this browser, on your device. NeatCV does not upload resume text, photos or files to a server. Clearing site data removes the local copy, so download a backup first.',
    },
  },
  {
    question: {
      ru: 'Какую PDF-копию отправить работодателю?',
      en: 'Which PDF should I send to an employer?',
    },
    answer: {
      ru: 'Выберите «Для отправки»: в файле только выбранная языковая версия, без исходных данных. Редактируемый PDF и JSON содержат все языковые версии и оформление — храните их как личную резервную копию.',
      en: 'Choose “For sharing”: the file contains only the selected language, without editable source data. Editable PDFs and JSON contain every language version and design settings; keep them as private backups.',
    },
  },
  {
    question: {
      ru: 'Можно ли поменять шаблон после заполнения?',
      en: 'Can I change the template after writing?',
    },
    answer: {
      ru: 'Да. Откройте шаг «Шаблон» и выберите другой дизайн: текст, контакты и языковые версии останутся на месте. Перед отправкой проверьте страницы и текст PDF.',
      en: 'Yes. Open the Template step and choose another design: text, contacts and language versions stay in place. Check the PDF pages and text before sending it.',
    },
  },
  {
    question: {
      ru: 'Какой шаблон лучше для автоматического отбора?',
      en: 'Which template should I choose for automated screening?',
    },
    answer: {
      ru: 'Для более простого порядка чтения выберите одноколоночный дизайн. У Editorial две колонки: обязательно проверьте извлечённый текст. Ни один шаблон не гарантирует результат отбора.',
      en: 'Choose a single-column design for a simpler reading order. Editorial has two columns: check its extracted text carefully. No template guarantees a screening outcome.',
    },
  },
  {
    question: {
      ru: 'Можно ли открыть обычный PDF для редактирования?',
      en: 'Can I reopen any PDF for editing?',
    },
    answer: {
      ru: 'Сейчас редактор открывает редактируемые PDF-копии NeatCV и JSON Resume, до 10 МБ. Обычные PDF, сканы и PDF для отправки не содержат исходных данных для восстановления полей.',
      en: 'The editor currently opens editable NeatCV PDFs and JSON Resume, up to 10 MB. Ordinary PDFs, scans and sharing PDFs do not contain the source data needed to restore editable fields.',
    },
  },
]
export function Faq({
  locale,
  expanded = false,
}: {
  locale: Locale
  expanded?: boolean
}) {
  const t = translator(locale)
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <h2 id="faq-title">
        {t('Частые вопросы', 'Frequently asked questions')}
      </h2>
      {faq.map((item) =>
        expanded ? (
          <div className="faq-answer" key={item.question.en}>
            <h3>{t(item.question.ru, item.question.en)}</h3>
            <p>{t(item.answer.ru, item.answer.en)}</p>
          </div>
        ) : (
          <Disclosure
            key={item.question.en}
            summary={t(item.question.ru, item.question.en)}
          >
            <p>{t(item.answer.ru, item.answer.en)}</p>
          </Disclosure>
        ),
      )}
    </section>
  )
}
