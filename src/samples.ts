import type { Locale } from './model'

/** Translatable text of the fictional example resume, one entry per language. */
export interface SampleText {
  name: string
  label: string
  location: string
  summary: string
  work: [string, string][]
  education: [string, string]
  skills: string
  languages: [string, string][]
}

export const samples: Record<Locale, SampleText> = {
  en: {
    name: 'Alex Morgan',
    label: 'Product designer',
    location: 'Berlin, Germany',
    summary:
      'Product designer with 6 years of turning complex problems into clear digital experiences. Raised checkout conversion by 24% with research-led redesigns. Looking for a product team where user needs and business goals meet.',
    work: [
      [
        'Product designer',
        'Redesigned checkout, increasing conversion by 24%.\nBuilt a 60-component design system across three products.\nLed 30 user interviews and tested ideas with engineering.',
      ],
      [
        'UX/UI designer',
        'Designed a dashboard for 12,000 customers.\nReduced time to complete key tasks by 35%.',
      ],
    ],
    education: ['BA, Visual communication', 'Universität der Künste Berlin'],
    skills:
      'Figma, User research, Prototyping, Design systems, Usability testing, Accessibility, HTML / CSS',
    languages: [
      ['Russian', 'Native'],
      ['German', 'C1 — advanced'],
      ['English', 'C1 — advanced'],
    ],
  },
  ru: {
    name: 'Александра Морозова',
    label: 'Продуктовый дизайнер',
    location: 'Берлин, Германия',
    summary:
      'Создаю понятные цифровые продукты — от первого исследования до запуска. Соединяю потребности людей и задачи бизнеса в простых, продуманных решениях.',
    work: [
      [
        'Продуктовый дизайнер',
        'Переработала оформление заказа и повысила конверсию на 24%.\nСоздала дизайн-систему из 60 компонентов для трёх продуктов.\nПровела 30 интервью и проверила гипотезы с командой разработки.',
      ],
      [
        'UX/UI-дизайнер',
        'Спроектировала личный кабинет для 12 000 пользователей.\nСократила время выполнения основного сценария на 35%.',
      ],
    ],
    education: [
      'Дизайн и визуальные коммуникации',
      'Universität der Künste Berlin',
    ],
    skills:
      'Figma, UX-исследования, Прототипирование, Дизайн-системы, Юзабилити-тестирование, Доступность, HTML / CSS',
    languages: [
      ['Русский', 'Родной'],
      ['Немецкий', 'C1 — продвинутый'],
      ['Английский', 'C1 — продвинутый'],
    ],
  },
  de: {
    name: 'Alex Morgan',
    label: 'Produktdesignerin',
    location: 'Berlin, Deutschland',
    summary:
      'Produktdesignerin mit 6 Jahren Erfahrung, die komplexe Probleme in klare digitale Produkte verwandelt. Steigerte die Checkout-Konversion durch forschungsbasierte Redesigns um 24 %. Sucht ein Produktteam, in dem Nutzerbedürfnisse und Geschäftsziele zusammenkommen.',
    work: [
      [
        'Produktdesignerin',
        'Checkout neu gestaltet und die Konversion um 24 % gesteigert.\nDesignsystem mit 60 Komponenten für drei Produkte aufgebaut.\n30 Nutzerinterviews geführt und Hypothesen mit der Entwicklung getestet.',
      ],
      [
        'UX/UI-Designerin',
        'Kundenportal für 12.000 Nutzer konzipiert.\nBearbeitungszeit der wichtigsten Aufgaben um 35 % verkürzt.',
      ],
    ],
    education: ['B.A. Visuelle Kommunikation', 'Universität der Künste Berlin'],
    skills:
      'Figma, Nutzerforschung, Prototyping, Designsysteme, Usability-Tests, Barrierefreiheit, HTML / CSS',
    languages: [
      ['Russisch', 'Muttersprache'],
      ['Deutsch', 'C1 — fortgeschritten'],
      ['Englisch', 'C1 — fortgeschritten'],
    ],
  },
  es: {
    name: 'Alex Morgan',
    label: 'Diseñadora de producto',
    location: 'Berlín, Alemania',
    summary:
      'Diseñadora de producto con 6 años de experiencia convirtiendo problemas complejos en experiencias digitales claras. Aumentó un 24 % la conversión del checkout con rediseños basados en investigación. Busca un equipo de producto donde se unan las necesidades de los usuarios y los objetivos del negocio.',
    work: [
      [
        'Diseñadora de producto',
        'Rediseñó el checkout y aumentó la conversión un 24 %.\nCreó un sistema de diseño de 60 componentes para tres productos.\nDirigió 30 entrevistas con usuarios y validó hipótesis con desarrollo.',
      ],
      [
        'Diseñadora UX/UI',
        'Diseñó un panel de cliente para 12.000 usuarios.\nRedujo un 35 % el tiempo de las tareas principales.',
      ],
    ],
    education: [
      'Grado en Comunicación Visual',
      'Universität der Künste Berlin',
    ],
    skills:
      'Figma, Investigación de usuarios, Prototipado, Sistemas de diseño, Pruebas de usabilidad, Accesibilidad, HTML / CSS',
    languages: [
      ['Ruso', 'Nativo'],
      ['Alemán', 'C1 — avanzado'],
      ['Inglés', 'C1 — avanzado'],
    ],
  },
  bg: {
    name: 'Александра Морозова',
    label: 'Продуктов дизайнер',
    location: 'Берлин, Германия',
    summary:
      'Продуктов дизайнер с 6 години опит в превръщането на сложни проблеми в ясни дигитални продукти. Повиших конверсията на поръчките с 24% чрез редизайн, основан на проучвания. Търся продуктов екип, в който нуждите на потребителите и целите на бизнеса се срещат.',
    work: [
      [
        'Продуктов дизайнер',
        'Преработих процеса на поръчка и повиших конверсията с 24%.\nСъздадох дизайн система от 60 компонента за три продукта.\nПроведох 30 интервюта и проверих хипотези с екипа по разработка.',
      ],
      [
        'UX/UI дизайнер',
        'Проектирах клиентски портал за 12 000 потребители.\nСъкратих времето за основните задачи с 35%.',
      ],
    ],
    education: [
      'Бакалавър, Визуални комуникации',
      'Universität der Künste Berlin',
    ],
    skills:
      'Figma, Потребителски проучвания, Прототипиране, Дизайн системи, Тестове за използваемост, Достъпност, HTML / CSS',
    languages: [
      ['Руски', 'Майчин'],
      ['Немски', 'C1 — напреднал'],
      ['Английски', 'C1 — напреднал'],
    ],
  },
  uk: {
    name: 'Олександра Морозова',
    label: 'Продуктова дизайнерка',
    location: 'Берлін, Німеччина',
    summary:
      'Продуктова дизайнерка з 6 роками досвіду перетворення складних задач на зрозумілі цифрові продукти. Підвищила конверсію оформлення замовлення на 24% завдяки редизайну на основі досліджень. Шукаю продуктову команду, де зустрічаються потреби людей і цілі бізнесу.',
    work: [
      [
        'Продуктова дизайнерка',
        'Переробила оформлення замовлення й підвищила конверсію на 24%.\nСтворила дизайн-систему з 60 компонентів для трьох продуктів.\nПровела 30 інтерв’ю та перевірила гіпотези з командою розробки.',
      ],
      [
        'UX/UI-дизайнерка',
        'Спроєктувала особистий кабінет для 12 000 користувачів.\nСкоротила час виконання основного сценарію на 35%.',
      ],
    ],
    education: [
      'Бакалавр, Візуальні комунікації',
      'Universität der Künste Berlin',
    ],
    skills:
      'Figma, UX-дослідження, Прототипування, Дизайн-системи, Юзабіліті-тестування, Доступність, HTML / CSS',
    languages: [
      ['Російська', 'Рідна'],
      ['Німецька', 'C1 — просунутий'],
      ['Англійська', 'C1 — просунутий'],
    ],
  },
}
