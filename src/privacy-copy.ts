export const privacyCopy = {
  title: {
    ru: 'Приватность',
    en: 'Privacy',
  },
  headline: {
    ru: 'Резюме остаётся на вашем устройстве.',
    en: 'Your resume stays on your device.',
  },
  intro: {
    ru: 'Здесь описано, как NeatCV работает с резюме, хранилищем браузера и дополнительными сервисами.',
    en: 'This notice explains how NeatCV handles your resume, browser storage and optional services.',
  },
  updated: {
    ru: 'Обновлено: 6 октября 2026',
    en: 'Updated: 6 October 2026',
  },
  contents: {
    ru: 'На этой странице',
    en: 'On this page',
  },
  files: {
    ru: 'Резюме и файлы',
    en: 'Resume and files',
  },
  filesBody: {
    ru: 'Редактирование, импорт файлов, обрезка фото и создание PDF выполняются в браузере. NeatCV не загружает резюме на сервер и не требует аккаунта. Локальное резюме сохраняется в IndexedDB.',
    en: 'Editing, importing files, cropping your photo and generating PDFs happen in your browser. NeatCV does not upload your resume or require an account. The local resume is saved in IndexedDB.',
  },
  exports: {
    ru: 'PDF для отправки содержит выбранный язык. Редактируемый PDF и JSON-копия также содержат все языковые версии и настройки, включая скрытый из PDF для отправки текст. Храните такие копии для себя. Получателей скачанных файлов выбираете вы.',
    en: 'Sharing PDFs contain the selected language. Editable PDFs and JSON backups also contain every language version and design settings, including content hidden from the sharing PDF. Keep those backups for yourself. You choose who receives downloaded files.',
  },
  storage: {
    ru: 'Хранилище браузера',
    en: 'Browser storage',
  },
  storageBody: {
    ru: 'Язык, тема, расположение панелей, настройки подсказок и вставленная вакансия хранятся локально. Они остаются до очистки данных сайта вами или браузером. Приложение не использует рекламные cookies.',
    en: 'Language, theme, editor layout, guidance preferences and a pasted job posting are stored locally. They remain until you clear site data or your browser removes them. The app does not use advertising cookies.',
  },
  sources: {
    ru: 'Метки источников',
    en: 'Source labels',
  },
  sourcesBody: {
    ru: 'Ссылки с ?ref=reddit и подобными метками помогают понять, откуда приходят посетители. Первая и последняя корректные метки, площадка и время визита хранятся отдельно от резюме 30 дней. Возвращение без метки не продлевает срок. В копии резюме метки не попадают.',
    en: 'Links with ?ref=reddit or similar labels help measure where visits come from. The first and latest valid labels, platform and timestamps are stored separately from your resume for 30 days. Untagged returns do not renew that period. Labels never enter resume backups.',
  },
  umami: {
    ru: 'Umami · статистика использования',
    en: 'Umami · usage analytics',
  },
  disabled: {
    ru: 'Подготовлен · сейчас выключен',
    en: 'Prepared · currently disabled',
  },
  configured: {
    ru: 'Настроен в этой версии',
    en: 'Configured in this build',
  },
  umamiBody: {
    ru: 'Umami — дополнительный сервис, для которого нужен ID сайта. После подключения он получает события визита, создания резюме, открытия примера, импорта и скачивания с метками источника, языком, шаблоном и форматом файла, где это применимо. Код событий исключает текст резюме, имена, контакты, фото, имена файлов и полные параметры URL.',
    en: 'Umami is optional and requires a configured website ID. If enabled, it receives visits and successful resume creation, example, import and download events, with source labels, language, template and file format where relevant. Our event code excludes resume text, names, contacts, photos, file names and full URL queries.',
  },
  umamiConnection: {
    ru: 'Сервис статистики также получает данные соединения, например IP-адрес. Отчёты могут включать браузер, устройство и примерную страну. NeatCV не настраивает запись сеансов или идентификацию пользователя между сайтами.',
    en: 'A receiving analytics service also receives connection information such as your IP address. Reports may include browser, device and approximate country. NeatCV does not configure session replay or cross-site user identification.',
  },
  optout: {
    ru: 'Umami не использует cookies для отслеживания. Do Not Track и Global Privacy Control блокируют загрузку трекера и отправку событий в NeatCV. Без корректного ID запросов к Umami нет.',
    en: 'Umami uses no tracking cookies. Do Not Track and Global Privacy Control prevent its tracker loading and event transmission in NeatCV. When no valid ID is configured, no Umami requests are made.',
  },
  umamiNotice: {
    ru: 'Политика приватности Umami',
    en: 'Umami privacy notice',
  },
  sentry: {
    ru: 'Sentry · отчёты об ошибках',
    en: 'Sentry · error reporting',
  },
  planned: {
    ru: 'Планируется · не подключён',
    en: 'Planned · not connected',
  },
  sentryBody: {
    ru: 'Sentry планируется для диагностики технических сбоев. Он не установлен и не подключён; отчёты в Sentry не отправляются. До подключения здесь будут описаны конкретные диагностические данные, хостинг, сроки хранения и настройки. Поля резюме, фото, импортируемые файлы и запись редактора должны быть исключены.',
    en: 'Sentry is a planned service for diagnosing technical failures. It is not installed or connected, and no Sentry reports are sent. Before activation, this notice will explain the exact diagnostic data, hosting, retention and controls. Resume fields, photos, imported files and editor recordings must be excluded.',
  },
  sentryDocs: {
    ru: 'Документация Sentry о сборе данных',
    en: 'Sentry data collection documentation',
  },
  hosting: {
    ru: 'Хостинг и внешние ссылки',
    en: 'Hosting and external links',
  },
  hostingBody: {
    ru: 'GitHub Pages обслуживает сайт и его шрифты. GitHub записывает IP-адреса посетителей в целях безопасности независимо от дополнительной аналитики. Эти журналы регулируются политикой приватности GitHub.',
    en: 'GitHub Pages serves this website and its fonts. GitHub logs visitor IP addresses for security, independently of optional analytics. These hosting logs are governed by GitHub’s privacy statement.',
  },
  external: {
    ru: 'GitHub, LinkedIn и другие внешние ссылки ведут на сервисы со своими правилами приватности. Отправленную туда вами информацию обрабатывают эти сервисы. Не включайте личные данные резюме в публичные сообщения об ошибках.',
    en: 'GitHub, LinkedIn and other external links open services with their own privacy practices. Information you choose to send there is handled by those services. Do not include private resume details in public issue reports.',
  },
  githubNotice: {
    ru: 'Политика приватности GitHub',
    en: 'GitHub privacy statement',
  },
  choices: {
    ru: 'Ваши возможности',
    en: 'Your choices',
  },
  choicesBody: {
    ru: 'Перед очисткой данных браузера сохраните редактируемый PDF или JSON-копию. Чтобы удалить локальное резюме, настройки и метки, очистите данные сайта neatcv.cc в настройках браузера. Скачанные файлы останутся: управляйте ими на устройстве.',
    en: 'Save an editable PDF or JSON backup before clearing browser data. To remove the local resume, preferences and source labels, clear site data for neatcv.cc in your browser settings. This does not delete downloaded files; manage those on your device.',
  },
  contact: {
    ru: 'Контакт и обновления',
    en: 'Contact and updates',
  },
  contactBody: {
    ru: 'Автор NeatCV — Nikita Nedyalkov. Вопросы о приватности можно задать Никите в LinkedIn. Эта страница будет обновлена до подключения новых сервисов или существенных изменений обработки данных.',
    en: 'NeatCV is made by Nikita Nedyalkov. For privacy questions, contact Nikita on LinkedIn. This notice will be updated before new services or materially different data processing are introduced.',
  },
  back: {
    ru: 'Вернуться в NeatCV',
    en: 'Back to NeatCV',
  },
} as const
