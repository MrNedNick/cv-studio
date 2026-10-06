const messages: Record<string, string> = {
  'Your resume stays on your device.':
    'Автобиографията остава на вашето устройство.',
  'This notice explains how NeatCV handles your resume, browser storage and optional services.':
    'Тук е описано как NeatCV обработва автобиографията, съхранението в браузъра и допълнителните услуги.',
  'Updated: 6 October 2026': 'Обновено: 6 октомври 2026',
  'On this page': 'На тази страница',
  'Resume and files': 'Автобиография и файлове',
  'Editing, importing files, cropping your photo and generating PDFs happen in your browser. NeatCV does not upload your resume or require an account. The local resume is saved in IndexedDB.':
    'Редактирането, импортът, изрязването на снимката и създаването на PDF се извършват в браузъра. NeatCV не качва автобиографията на сървър и не изисква профил. Локалното копие се пази в IndexedDB.',
  'Sharing PDFs contain the selected language. Editable PDFs and JSON backups also contain every language version and design settings, including content hidden from the sharing PDF. Keep those backups for yourself. You choose who receives downloaded files.':
    'PDF за споделяне съдържа избрания език. Редактируемите PDF и JSON копия включват всички езикови версии и настройки, включително скритото съдържание. Пазете тези копия за себе си. Вие избирате получателите на изтеглените файлове.',
  'Browser storage': 'Съхранение в браузъра',
  'Language, theme, editor layout, guidance preferences and a pasted job posting are stored locally. They remain until you clear site data or your browser removes them. The app does not use advertising cookies.':
    'Езикът, темата, подредбата на редактора, настройките за помощ и поставената обява се пазят локално, докато вие или браузърът изтриете данните на сайта. Приложението не използва рекламни бисквитки.',
  'Source labels': 'Етикети за източника',
  'Links with ?ref=reddit or similar labels help measure where visits come from. The first and latest valid labels, platform and timestamps are stored separately from your resume for 30 days. Untagged returns do not renew that period. Labels never enter resume backups.':
    'Връзки с ?ref=reddit и подобни етикети помагат да се измери откъде идват посещенията. Първият и последният валиден етикет, платформата и времето се пазят отделно от автобиографията за 30 дни. Посещения без етикет не удължават срока. Копията не съдържат етикети.',
  'Umami · usage analytics': 'Umami · статистика за използването',
  'Prepared · currently disabled': 'Подготвен · в момента изключен',
  'Configured in this build': 'Настроен в тази версия',
  'Umami is optional and requires a configured website ID. If enabled, it receives visits and successful resume creation, example, import and download events, with source labels, language, template and file format where relevant. Our event code excludes resume text, names, contacts, photos, file names and full URL queries.':
    'Umami е допълнителна услуга и изисква настроен ID на сайта. При включване получава посещения и успешни създавания, примери, импорти и изтегляния с източник, език, шаблон и формат, когато е приложимо. Кодът изключва текста на автобиографията, имена, контакти, снимки, имена на файлове и пълни URL параметри.',
  'A receiving analytics service also receives connection information such as your IP address. Reports may include browser, device and approximate country. NeatCV does not configure session replay or cross-site user identification.':
    'Услугата за статистика получава и данни за връзката, например IP адрес. Отчетите може да включват браузър, устройство и приблизителна държава. NeatCV не настройва записи на сесии или идентификация между сайтове.',
  'Umami uses no tracking cookies. Do Not Track and Global Privacy Control prevent its tracker loading and event transmission in NeatCV. When no valid ID is configured, no Umami requests are made.':
    'Umami не използва бисквитки за проследяване. Do Not Track и Global Privacy Control блокират зареждането и изпращането на събития в NeatCV. Без валиден ID няма заявки към Umami.',
  'Umami privacy notice': 'Политика за поверителност на Umami',
  'Sentry · error reporting': 'Sentry · отчети за грешки',
  'Sentry data collection documentation':
    'Документация на Sentry за събирането на данни',
  'Hosting and external links': 'Хостинг и външни връзки',
  'GitHub Pages serves this website and its fonts. GitHub logs visitor IP addresses for security, independently of optional analytics. These hosting logs are governed by GitHub’s privacy statement.':
    'GitHub Pages обслужва сайта и шрифтовете му. GitHub записва IP адресите на посетителите за сигурност, независимо от допълнителната статистика. За тези записи важи политиката на GitHub.',
  'GitHub, LinkedIn and other external links open services with their own privacy practices. Information you choose to send there is handled by those services. Do not include private resume details in public issue reports.':
    'GitHub, LinkedIn и други външни връзки водят към услуги със собствени правила. Те обработват информацията, която решите да им изпратите. Не включвайте лични данни от автобиографията в публични отчети за грешки.',
  'GitHub privacy statement': 'Политика за поверителност на GitHub',
  'Your choices': 'Вашите възможности',
  'Save an editable PDF or JSON backup before clearing browser data. To remove the local resume, preferences and source labels, clear site data for neatcv.cc in your browser settings. This does not delete downloaded files; manage those on your device.':
    'Преди изтриване на данните в браузъра запазете редактируем PDF или JSON копие. За премахване на локалната автобиография, настройки и етикети изтрийте данните на neatcv.cc в браузъра. Изтеглените файлове остават на устройството.',
  'Contact and updates': 'Контакт и обновления',
  'NeatCV is made by Nikita Nedyalkov. For privacy questions, contact Nikita on LinkedIn. This notice will be updated before new services or materially different data processing are introduced.':
    'Автор на NeatCV е Nikita Nedyalkov. За въпроси за поверителността се свържете с Никита в LinkedIn. Страницата ще бъде обновена преди нови услуги или съществени промени в обработката на данни.',
  'Back to NeatCV': 'Обратно към NeatCV',
  Privacy: 'Поверителност',
  'Your resume stays in your browser':
    'Автобиографията остава във вашия браузър',
  'Privacy — opens in a new tab': 'Поверителност — в нов раздел',
  'Link targets to check: {count}': 'Адреси за проверка: {count}',
  'Use an email with @ and a domain. This address will appear in the PDF without a link.':
    'Въведете имейл с @ и домейн. Този адрес ще се появи в PDF без връзка.',
  'Use an http or https address, like example.com. This link will be left out of the PDF.':
    'Използвайте http или https адрес, например example.com. Тази връзка няма да попадне в PDF.',
  'Edit {section}': 'Редактиране: {section}',
  'Text to check': 'Текст за проверка',
  'These passages were not found in the extracted PDF text. Check them in the PDF tab or edit the section.':
    'Тези откъси не са намерени в извлечения текст на PDF. Проверете ги в раздела PDF или редактирайте съответния раздел.',
  'Passages not found: {count}': 'Ненамерени откъси: {count}',
  'Page {page}: text may extend past the paper edge. Try a smaller text size or another template and check the PDF tab.':
    'Страница {page}: текстът може да излиза извън листа. Опитайте по-малък размер на текста или друг шаблон и проверете раздела PDF.',
  'Passages at the edge: {count}': 'Откъси при ръба: {count}',
  'No missing passages or text outside the paper edges found.':
    'Не са открити липсващи откъси или текст извън краищата на листа.',
  'Check PDF text': 'Проверка на текста в PDF',
  'Text extracted from PDF': 'Текст, извлечен от PDF',
  'Check the reading order and links in the actual PDF. Everything runs in your browser.':
    'Проверете реда на четене и връзките в самия PDF. Всичко се обработва в браузъра.',
  'Checking PDF text…': 'Проверка на текста в PDF…',
  'Could not read the PDF text. Try again.':
    'Текстът в PDF не може да бъде прочетен. Опитайте отново.',
  'This page has no extractable text. Check it in the PDF tab.':
    'На тази страница няма текст за извличане. Проверете я в раздела PDF.',
  'Links in PDF': 'Връзки в PDF',
  'No links on this page.': 'На тази страница няма връзки.',
  'Hide form · Ctrl/⌘ \\': 'Скриване на формуляра · Ctrl/⌘ \\',
  'Show form · Ctrl/⌘ \\': 'Показване на формуляра · Ctrl/⌘ \\',
  'Add your name and role': 'Добавете име и длъжност',
  'Click the name field, then add your role below. Edits save automatically in this browser.':
    'Натиснете полето за име и добавете длъжността си отдолу. Промените се запазват автоматично в този браузър.',
  'Open the writing examples for help describing your experience and results. Hide an unneeded section without deleting its text.':
    'Отворете примерите за описване на опит и резултати. Скрийте ненужен раздел, без да изтривате текста му.',
  'Check the gaps above. Optionally paste a vacancy here to compare skills. Then inspect the PDF and keep both copies.':
    'Проверете пропуските по-горе. По желание поставете обява тук, за да сравните уменията. След това прегледайте PDF и запазете двете копия.',
  'Check the actual PDF pages. Click Text for reading and copying. Download a sharing copy and keep an editable copy for yourself.':
    'Проверете страниците на действителния PDF. Натиснете Текст за четене и копиране. Изтеглете копие за споделяне и запазете редактируемо копие за себе си.',
  'Skip walkthrough': 'Пропускане на обиколката',
  'Continue walkthrough': 'Продължаване на обиколката',
  'Walk me through the editor': 'Покажи редактора стъпка по стъпка',
  'Start walkthrough': 'Започни обиколката',
  'The preview shows example text until you write your own. Choose a look, then Personal details.':
    'Прегледът показва примерен текст, докато напишете свой. Изберете оформление и преминете към Лични данни.',
  'Each language has its own text; nothing is translated automatically. Contacts, dates and links are shared.':
    'Всеки език има свой текст; няма автоматичен превод. Контактите, датите и връзките са общи.',
  'Enter or comma adds a skill. Paste a comma-separated list to add several at once.':
    'Enter или запетая добавя умение. Поставете списък със запетаи, за да добавите няколко наведнъж.',
  'Choose a level from A1–C2 or write your own. These are languages you speak, not the PDF language.':
    'Изберете ниво A1–C2 или го опишете сами. Това са езиците, които говорите, не езикът на PDF.',
  'Add several skills at once': 'Добавете няколко умения наведнъж',
  'Another language, a separate version': 'Друг език, отделна версия',
  'Choose a level that fits': 'Изберете подходящо ниво',
  'Choose what you need help with. You can write and download in any order; completing every step is optional.':
    'Изберете за какво ви трябва помощ. Можете да пишете и изтегляте в произволен ред; не е нужно да попълвате всяка стъпка.',
  'Contextual editor tips': 'Подсказки по време на редактиране',
  'Dismiss this editor tip': 'Не показвайте тази подсказка отново',
  'Editor guide': 'Помощ за редактора',
  'Editor tip': 'Подсказка за редактора',
  'Keep only the sections you need': 'Оставете само нужните раздели',
  'Restore dismissed editor tips': 'Възстановете скритите подсказки',
  'Review, then keep two copies': 'Проверете и запазете две копия',
  'See what the reader will see': 'Вижте какво ще види читателят',
  'Show in editor': 'Покажете в редактора',
  'Start with the look': 'Започнете с оформлението',
  'Checks help you spot gaps; they do not rate your chances of getting hired. Inspect the PDF, download For sharing for employers, and keep an Editable copy for yourself to reopen here and continue editing.':
    'Проверките помагат да забележите пропуски, но не оценяват шансовете ви за работа. Прегледайте PDF, изтеглете За споделяне за работодателите и запазете Редактируемо копие за себе си, за да го отворите тук и продължите.',
  'Choose a language and level. A1–A2 is basic, B1–B2 independent, C1–C2 proficient. You can describe the level in your own words. These are languages you speak; the PDF language is selected at the top.':
    'Изберете език и ниво. A1–A2 е основно, B1–B2 самостоятелно, C1–C2 свободно владеене. Можете да опишете нивото със свои думи. Това са езиците, които говорите; езикът на PDF се избира горе.',
  'Do not need this section? Turn off In resume: your text is kept and Next skips this step. Open How to write this section for structure and examples. Collapsing an entry keeps it in the PDF.':
    'Не ви трябва този раздел? Изключете В резюмето: текстът остава, а Напред пропуска тази стъпка. Отворете Как да напишете този раздел за структура и примери. Свитият запис остава в PDF.',
  'Edits save automatically. They will not appear on another device, and clearing browser data removes this copy. When you finish, keep an editable PDF or use the actions menu to save JSON.':
    'Промените се запазват автоматично. Няма да се появят на друго устройство, а изчистването на данните на браузъра премахва това копие. Накрая запазете редактируем PDF или JSON от менюто с действия.',
  'Pick a template, then move to Personal details. While your resume is empty, the preview uses example text; it is not added to your resume. On a phone, open Preview to see the design.':
    'Изберете шаблон и преминете към Лични данни. Докато резюмето е празно, прегледът показва примерен текст, който не се добавя в него. На телефон отворете Преглед, за да видите оформлението.',
  'The language selector at the top changes the interface and resume version. Text is not translated automatically; an empty version can copy another as a starting point. Contacts, dates and links are shared. Sharing PDFs contain the selected version.':
    'Изборът на език горе сменя интерфейса и версията на резюмето. Текстът не се превежда автоматично; празна версия може да започне като копие на друга. Контактите, датите и връзките са общи. PDF за споделяне съдържа избраната версия.',
  'This is the actual PDF: check every page and line break. Text view is useful for reading and copying. Zoom changes only the preview, not the text size in the file. Change text size in the Template step.':
    'Това е действителният PDF: проверете всяка страница и пренасяне на ред. Изгледът Текст е удобен за четене и копиране. Мащабът променя само прегледа, не размера на текста във файла. Променете размера в стъпката Шаблон.',
  'Type a skill and press Enter or comma. You can paste a list separated by commas. Suggestions below are optional; add only skills you actually have.':
    'Въведете умение и натиснете Enter или запетая. Можете да поставите списък, разделен със запетаи. Предложенията долу са по избор; добавяйте само умения, които имате.',
  'Could not load this language. Reload and try again.':
    'Този език не можа да се зареди. Презареди страницата и опитай отново.',
  '1–2 pages': '1–2 страници',
  '6–30 skills': '6–30 умения',
  'A FORMAT FOR YOUR STORY': 'ФОРМАТ ЗА ВАШАТА ИСТОРИЯ',
  'A beautiful resume, without the busywork. Add your experience, choose a style, and download your PDF. All for free.':
    'Красива автобиография без излишна работа. Добавете опита си, изберете стил и изтеглете PDF. Изцяло безплатно.',
  'A big name and confident headings': 'Голямо име и уверени заглавия',
  'A blank resume': 'Празна автобиография',
  'A bold header over calm, clear text':
    'Ярка заглавна част над спокоен, ясен текст',
  'A considered first impression': 'Обмислено първо впечатление',
  'A distinctive two-column layout': 'Отличително оформление в две колони',
  'A few focused sentences about your experience and strengths.':
    'Няколко точни изречения за опита и силните Ви страни.',
  'A single-column template is a safer choice for automated screening.':
    'За автоматичен подбор по-сигурният избор е шаблон в една колона.',
  'A solid base': 'Добра основа',
  'A start month and year for each entry; screening systems rely on them.':
    'Месец и година на започване за всеки запис — системите за подбор разчитат на тях.',
  'A strong resume': 'Силна автобиография',
  'About {count} words now. Keep what matters for this role.':
    'Сега има около {count} думи. Оставете важното за тази позиция.',
  'Accent color': 'Акцентен цвят',
  'Achievements and impact': 'Постижения и резултати',
  'Add LinkedIn and a portfolio or GitHub link. Recruiters open them before calling.':
    'Добавете LinkedIn и линк към портфолио или GitHub. Рекрутърите ги отварят преди да се обадят.',
  'Add an email or phone number so people can contact you.':
    'Добавете имейл или телефон, за да могат да се свържат с Вас.',
  'Add an entry to insert verbs:': 'Добавете запис, за да вмъквате глаголи:',
  'Add an entry, or skip this section.':
    'Добавете запис или пропуснете този раздел.',
  'Add entry': 'Добави запис',
  'Add measurable outcomes to your experience: numbers, time saved, or scale.':
    'Добавете измерими резултати към опита си: числа, спестено време или мащаб.',
  'Add only what you genuinely have — ideally in skills and in an experience point.':
    'Добавяйте само това, което наистина владеете — най-добре и в уменията, и в точка от опита.',
  'Add photo': 'Добави снимка',
  'Add points that include numbers.': 'Добавете точки с числа.',
  'Add to skills': 'Добави към уменията',
  'Add your education and relevant courses.':
    'Добавете образованието си и подходящи курсове.',
  'Add your name so your resume is easy to identify.':
    'Добавете името си, за да се разпознава лесно автобиографията.',
  After: 'След',
  'Aim for 2–4 specific sentences. Skip generic buzzwords.':
    '2–4 конкретни изречения. Без празни модни думи.',
  'Aim for numbers in at least half of the points: %, money, time, users, team size.':
    'Числа поне в половината точки: %, пари, време, потребители, размер на екипа.',
  'All templates, downloads, and editing are available without sign-up, subscriptions, or watermarks.':
    'Всички шаблони, изтегляния и редакции са достъпни без регистрация, абонамент и водни знаци.',
  'Already covered': 'Вече е включено',
  'At its': 'В най-добрия',
  'At least 3 achievement points for your most recent job.':
    'Поне 3 постижения за последната Ви работа.',
  Author: 'Автор',
  Back: 'Назад',
  'Back to editing': 'Обратно към редакцията',
  Before: 'Преди',
  Blue: 'Син',
  'Both options are free, with no watermarks. Your data stays on your device.':
    'И двата варианта са безплатни и без водни знаци. Данните Ви остават на Вашето устройство.',
  'Briefly: who you are, your best result, what you want next.':
    'Накратко: кой сте, най-добрият Ви резултат и какво търсите.',
  Build: 'Създаване',
  Burgundy: 'Бордо',
  'By default these come from your name, job title, and skills. Change them under Design → PDF. Metadata describes the file; it does not guarantee a screening rank.':
    'По подразбиране се взимат от името, длъжността и уменията. Можете да ги промените в „Дизайн → PDF“. Метаданните описват файла; те не гарантират позиция при подбора.',
  'CONTACT DETAILS': 'КОНТАКТИ',
  Cancel: 'Отказ',
  'Centered and composed for senior roles':
    'Центриран и сдържан за старши позиции',
  'Certificates that a vacancy names belong here too.':
    'Тук са и сертификатите, които обявата споменава.',
  'Change the interface language at the top of the page and the resume language next to the document name. A resume can have up to six language versions: you translate the text; contacts, dates, and links are shared. The PDF shows the selected version.':
    'Езикът на интерфейса се сменя горе на страницата, а езикът на автобиографията — до името на документа. Една автобиография може да има до шест езикови версии: текста превеждате Вие, а контактите, датите и линковете са общи. PDF показва избраната версия.',
  'Check the name and file, then continue editing.':
    'Проверете името и файла и продължете с редакцията.',
  'Check your email: include @ and a domain.':
    'Проверете имейла: трябва да съдържа @ и домейн.',
  'Check your website link. Use an http or https address.':
    'Проверете линка към сайта. Използвайте адрес с http или https.',
  'Choose what feels like you. Switch templates any time without losing a word.':
    'Изберете това, което Ви подхожда. Сменяйте шаблона по всяко време, без да губите и дума.',
  'Choose your template and color. See every change in the live preview.':
    'Изберете шаблон и цвят. Всяка промяна се вижда веднага в прегледа.',
  'Choose “Editable copy” when downloading to include every language version and the design settings. Use “Open file” to restore that copy. “For sharing” contains only the selected language and cannot be reopened for editing.':
    'При изтегляне изберете „Редактируемо копие“, за да запазите всички езикови версии и оформлението. С „Отвори файл“ възстановявате това копие. „За изпращане“ съдържа само избрания език и не може да се отвори за редакция.',
  'City and country': 'Град и държава',
  'City and country are enough. A full street address is not needed.':
    'Град и държава са достатъчни. Пълен адрес не е нужен.',
  'Classic serif typography, centered':
    'Класическа типография със серифи, центрирана',
  'Classic uses a timeless monochrome palette.':
    'Classic използва безвремева монохромна палитра.',
  'Clear everything': 'Изчисти всичко',
  Close: 'Затвори',
  'Collapse all': 'Свий всички',
  Comfortable: 'Просторно',
  'Common in Germany, Austria and Switzerland. Usually left out in the US, UK and Canada.':
    'Обичайно в Германия, Австрия и Швейцария. В САЩ, Великобритания и Канада обикновено се пропуска.',
  Compact: 'Компактно',
  Company: 'Компания',
  'Concise points': 'Кратки точки',
  'Continue your resume': 'Продължете автобиографията',
  'Copy as plain text': 'Копирай като обикновен текст',
  'Copy from': 'Копирай от',
  'Copy text': 'Копирай текста',
  'Copy the text from another version and translate it, or start from scratch. Contacts and dates are already shared.':
    'Копирайте текста от друга версия и го преведете — или започнете отначало. Контактите и датите вече са общи.',
  'Could not create the PDF. Retry the download, or return to editing and save a JSON backup from the menu.':
    'PDF файлът не можа да бъде създаден. Опитайте изтеглянето отново или се върнете към редакцията и запазете JSON копие от менюто.',
  'Could not create the PDF. Try again or save a JSON backup.':
    'PDF файлът не можа да бъде създаден. Опитайте отново или запазете JSON копие.',
  'Could not open that image. Choose a JPG, PNG or WebP up to 15 MB.':
    'Изображението не можа да бъде отворено. Изберете JPG, PNG или WebP до 15 MB.',
  'Could not open this file. Choose JSON Resume or an editable PDF copy from NeatCV (up to 10 MB). Sharing copies and other PDFs do not include editable source.':
    'Файлът не можа да бъде отворен. Изберете JSON Resume или редактируемо PDF копие от NeatCV (до 10 MB). Копията за изпращане и другите PDF файлове не съдържат редактируем източник.',
  'Could not open your saved resume':
    'Запазената автобиография не можа да бъде отворена',
  'Create your resume': 'Създайте автобиография',
  'Ctrl / ⌘ Z to undo; Ctrl / ⌘ Shift Z to redo; Ctrl / ⌘ S to save a JSON backup. Guidance below the form takes you to the section to review.':
    'Ctrl / ⌘ Z — отмяна; Ctrl / ⌘ Shift Z — повторение; Ctrl / ⌘ S — запазване на JSON копие. Подсказките под формуляра водят до раздела за проверка.',
  'Dates for jobs and studies': 'Дати за работа и обучение',
  'Dates in the margin, career at a glance':
    'Дати в полето, кариерата с един поглед',
  'Degree / field of study': 'Степен / специалност',
  'Degree, institution and years. Recent graduates can add relevant courses or a thesis.':
    'Степен, учебно заведение и години. Наскоро завършилите могат да добавят курсове или дипломна работа.',
  'Delete this entry': 'Изтрий този запис',
  Description: 'Описание',
  Design: 'Дизайн',
  'Dismiss notification': 'Затвори известието',
  'Document title': 'Заглавие на документа',
  Done: 'Готово',
  Download: 'Изтегли',
  'Download .txt for forms': 'Изтегли .txt за формуляри',
  'Download PDF': 'Изтегли PDF',
  'Download a PDF with selectable text. Come back and edit whenever you need.':
    'Изтеглете PDF с текст, който може да се маркира. Върнете се и редактирайте, когато е нужно.',
  'Download it. Keep it editable.': 'Изтеглете го. Запазете го за редакция.',
  'Download the PDF, then check that text copies and links open.':
    'Изтеглете PDF и проверете, че текстът се копира и линковете се отварят.',
  'Download your resume': 'Изтеглете автобиографията си',
  'Drag to resize. Double-click to reset.':
    'Плъзнете, за да промените ширината. Двоен клик връща стандартната.',
  'EVERY TEMPLATE IS FREE': 'ВСИЧКИ ШАБЛОНИ СА БЕЗПЛАТНИ',
  'Editable copies can be reopened.':
    'Редактируемите копия могат да се отварят отново.',
  'Editable copy': 'Редактируемо копие',
  'Editable copy downloaded. Open it here to restore every language version and the design settings.':
    'Редактируемото копие е изтеглено. Отворете го тук, за да възстановите всички езикови версии и оформлението.',
  Editor: 'Редактор',
  Email: 'Имейл',
  'End date': 'Крайна дата',
  English: 'Английски',
  Entries: 'Записи',
  'Every template and feature is free': 'Всички шаблони и функции са безплатни',
  'Expand all': 'Разгъни всички',
  'Explore templates': 'Разгледайте шаблоните',
  'File name': 'Име на файла',
  'Fill in the sections at your own pace. Your changes save automatically.':
    'Попълвайте разделите със свое темпо. Промените се запазват автоматично.',
  'Fit page': 'Цяла страница',
  'Fit to width': 'По ширина',
  'For automated resume screening, choose any template except the two-column Editorial: the others read top to bottom.':
    'За автоматичен подбор изберете всеки шаблон без двуколонния Editorial: останалите се четат отгоре надолу.',
  'For reading and copying. See the PDF tab for the document layout.':
    'За четене и копиране. Оформлението на документа е в раздела PDF.',
  'For sharing': 'За изпращане',
  Forest: 'Горско зелено',
  Form: 'Формуляр',
  'Form width': 'Ширина на формуляра',
  'Formula: action verb + what you did + measurable result (Google’s X‑Y‑Z).':
    'Формула: глагол за действие + какво направихте + измерим резултат (X‑Y‑Z на Google).',
  'Free PDF download': 'Безплатно изтегляне на PDF',
  'Free from the first word to the final PDF.':
    'Безплатно от първата дума до готовия PDF.',
  'Free. That’s the whole story.': 'Безплатно. Това е всичко.',
  'Frequent in the posting': 'Често в обявата',
  'From a blank page': 'От празен лист',
  'Frontend engineer with 6 years in Vue and React. Cut page load time by 45% for 2M monthly users. Looking for a product team building complex interfaces.':
    'Frontend инженер с 6 години опит с Vue и React. Съкрати времето за зареждане с 45% за 2 млн. потребители месечно. Търси продуктов екип, който създава сложни интерфейси.',
  'Full PDF page': 'Цяла страница от PDF',
  'Full name': 'Име и фамилия',
  'Get a feel for how it works.': 'Вижте как работи.',
  'Good design, for everyone': 'Добър дизайн за всеки',
  'Got it': 'Разбрах',
  Graphite: 'Графит',
  'Great experience deserves': 'Добрият опит заслужава',
  Grow: 'Растеж',
  'Hard-working team player looking for new challenges.':
    'Трудолюбив екипен играч търси нови предизвикателства.',
  'Hide sections': 'Скрий разделите',
  'How it works': 'Как работи',
  'How to write this section': 'Как да попълните този раздел',
  Improve: 'Подобряване',
  'Include one result with a number.': 'Добавете един резултат с число.',
  'Include the skills that matter for your next role.':
    'Добавете уменията, които са важни за следващата Ви позиция.',
  'Includes every language version and the design settings. Keep it for yourself and reopen it here to continue editing.':
    'Съдържа всички езикови версии и оформлението. Запазете го за себе си и го отворете тук, за да продължите.',
  'Insert this structure': 'Вмъкни тази структура',
  Institution: 'Учебно заведение',
  'Interface language': 'Език на интерфейса',
  'Job posting text': 'Текст на обявата',
  'Job title': 'Длъжност',
  'Job title or speciality': 'Длъжност или специалност',
  'Keep an editable PDF copy for future changes':
    'Пазете редактируемо PDF копие за бъдещи промени',
  'Keep the example': 'Запази примера',
  'Keep your profile to 2–4 focused sentences.':
    'Ограничете профила до 2–4 точни изречения.',
  'Keyboard shortcuts.': 'Клавишни комбинации.',
  Keywords: 'Ключови думи',
  'LESS FORMATTING. MORE YOU.': 'ПО-МАЛКО ФОРМАТИРАНЕ. ПОВЕЧЕ ВИЕ.',
  'LET’S START WITH YOUR STORY': 'ДА ЗАПОЧНЕМ С ВАШАТА ИСТОРИЯ',
  Language: 'Език',
  'Last step: check the content, compare with a vacancy, and download your PDF.':
    'Последна стъпка: проверете съдържанието, сравнете с обява и изтеглете PDF.',
  Lead: 'Ръководство',
  'Leave optional fields blank — they won’t appear in your PDF.':
    'Оставете незадължителните полета празни — те няма да се появят в PDF.',
  'Let your experience speak': 'Нека опитът Ви говори',
  'LinkedIn, a portfolio, or GitHub — clickable, with the full address.':
    'LinkedIn, портфолио или GitHub — с линк и пълен адрес.',
  'List 8–25 concrete skills: tools, languages, methods. Skip “communication”.':
    'Посочете 8–25 конкретни умения: инструменти, езици, методи. Без „комуникативност“.',
  'List the languages you speak and your proficiency.':
    'Посочете езиците, които говорите, и нивото си.',
  'Look around, then start your own resume whenever you are ready.':
    'Разгледайте и започнете своята автобиография, когато сте готови.',
  'Looking good · {count}': 'Всичко е наред · {count}',
  'Main navigation': 'Основна навигация',
  'Make it yours': 'Направете я своя',
  'Margin headings and generous whitespace': 'Заглавия в полето и много въздух',
  'Match a job posting': 'Сравнение с обява',
  'Measurable results': 'Измерими резултати',
  'Missing from your resume': 'Липсва в автобиографията',
  Mixed: 'Смесен',
  'Modern template': 'Шаблон Modern',
  'More room for your experience': 'Повече място за опита Ви',
  'More than two pages. Try the compact template or shorten older experience.':
    'Повече от две страници. Опитайте компактния шаблон или съкратете по-стария опит.',
  'Most recent job first': 'Първо последната работа',
  'Most recent job first. 3–6 points for recent roles, 2–3 for older ones.':
    'Първо последната работа. 3–6 точки за скорошните позиции, 2–3 за по-старите.',
  'Move down': 'Надолу',
  'Move entry down': 'Премести записа надолу',
  'Move entry up': 'Премести записа нагоре',
  'Move up': 'Нагоре',
  'My resume': 'Моята автобиография',
  'Name and contact': 'Име и контакт',
  Navy: 'Тъмносин',
  Next: 'Напред',
  'Next page': 'Следваща страница',
  'No clichés': 'Без клишета',
  'No known skills found — check the frequent terms below.':
    'Не са открити познати умения — вижте честите думи по-долу.',
  'No placeholders left': 'Без незапълнени шаблони',
  'No sign-up': 'Без регистрация',
  'No sign-up. Your resume is never sent to a server.':
    'Без регистрация. Автобиографията Ви никога не се изпраща към сървър.',
  'No watermarks': 'Без водни знаци',
  'No “I” or “my”': 'Без „аз“ и „мой“',
  'Not saved': 'Не е запазено',
  'Nothing but text and whitespace': 'Само текст и въздух',
  'Nothing here yet': 'Тук още няма нищо',
  'Now: {count}. Concrete tools and methods, no generic traits.':
    'Сега: {count}. Конкретни инструменти и методи, без общи качества.',
  Olive: 'Маслинено',
  'One achievement per line. Include measurable results.':
    'Едно постижение на ред. Добавете измерими резултати.',
  'One line on the problem, one on what you built, one on the result.':
    'Ред за проблема, ред за решението, ред за резултата.',
  'One point, one or two lines — under about 35 words.':
    'Една точка — един-два реда, до около 35 думи.',
  'Only the selected language, without an editable attachment. Ready for a job application.':
    'Само избраният език, без редактируем прикачен файл. Готово за кандидатстване.',
  'Open PDF / JSON': 'Отвори PDF / JSON',
  'Open a resume from PDF or JSON': 'Отворете автобиография от PDF или JSON',
  'Open backup': 'Отвори резервното копие',
  'Open resume': 'Отвори автобиографията',
  'Open resume file': 'Отвори файл с автобиография',
  'Open this resume?': 'Да се отвори ли тази автобиография?',
  'Opening file…': 'Файлът се отваря…',
  'Opening replaces your current resume. Save a backup to return to it later. You can also undo right after opening.':
    'Отварянето заменя текущата автобиография. Запазете резервно копие, за да се върнете към нея. Можете и да отмените веднага след отварянето.',
  'Opening the editor…': 'Редакторът се отваря…',
  'PDF downloaded for sharing. It contains only the selected language. Your resume remains in the editor.':
    'PDF за изпращане е изтеглен. Съдържа само избрания език. Автобиографията Ви остава в редактора.',
  'PDF pages': 'Страници на PDF',
  'PDF preview could not load. Retry or switch to text.':
    'Прегледът на PDF не можа да се зареди. Опитайте отново или превключете към текста.',
  'PDF properties': 'Свойства на PDF',
  Page: 'Страница',
  'Pages: {pages} · A4': 'Страници: {pages} · A4',
  Panels: 'Панели',
  'Paste a job posting to see which of its skills and terms your resume already covers. Everything runs in your browser.':
    'Поставете обява, за да видите кои умения и термини от нея вече има в автобиографията Ви. Всичко се обработва в браузъра.',
  'Paste the job description…': 'Поставете описанието на позицията…',
  Phone: 'Телефон',
  'Photo (optional)': 'Снимка (по избор)',
  'Pick 2–4 projects that match the role. Link to the live version or code.':
    'Изберете 2–4 проекта, подходящи за позицията. Дайте линк към работещата версия или кода.',
  Plum: 'Сливово',
  'Points for your latest role': 'Точки за последната позиция',
  'Points start with actions, not duties.':
    'Точките започват с действия, а не със задължения.',
  'Preparing PDF…': 'PDF се подготвя…',
  'Preparing preview…': 'Прегледът се подготвя…',
  'Preparing…': 'Подготвя се…',
  Present: 'Момента',
  Preview: 'Преглед',
  'Preview mode': 'Режим на преглед',
  'Preview zoom': 'Мащаб на прегледа',
  'Previous page': 'Предишна страница',
  Proficiency: 'Ниво',
  'Profile links': 'Линкове към профили',
  'Profile: 2–4 sentences': 'Профил: 2–4 изречения',
  'Project link': 'Линк към проекта',
  'Project name': 'Име на проекта',
  'Prove your top skills with a point in your experience — that is what readers trust.':
    'Докажете ключовите си умения с точка от опита — на това читателите вярват най-много.',
  Purple: 'Лилаво',
  'Qualities are shown with facts.': 'Качествата са показани с факти.',
  'Ready for what’s next': 'Готова за следващата стъпка',
  'Ready to send?': 'Готови ли сте да изпратите?',
  'Redesigned the checkout flow, raising conversion by 18% in three months.':
    'Преработих процеса на поръчка и повиших конверсията с 18% за три месеца.',
  Redo: 'Повтори',
  'Redo · Ctrl/⌘ Shift Z': 'Повтори · Ctrl/⌘ Shift Z',
  'Remove entry': 'Премахни записа',
  'Remove photo': 'Премахни снимката',
  'Reorder sections or hide the ones you don’t need. Hidden content is kept.':
    'Пренаредете разделите или скрийте ненужните. Скритото съдържание се запазва.',
  Replace: 'Смени',
  'Replace text in [square brackets] with your own details.':
    'Заменете текста в [квадратни скоби] със своите данни.',
  'Replace “responsible for” and “helped” with what you actually did.':
    'Заменете „отговарях за“ и „помагах“ с това, което сте направили.',
  Research: 'Анализ',
  'Reset to the template’s order': 'Върни реда на шаблона',
  'Responsible for the checkout page.': 'Отговарях за страницата за поръчки.',
  'Resume actions': 'Действия с автобиографията',
  'Resume opened. Undo restores the previous document.':
    'Автобиографията е отворена. „Отмени“ връща предишния документ.',
  'Resume preview': 'Преглед на автобиографията',
  'Resume steps': 'Стъпки на автобиографията',
  'Resume text': 'Текст на автобиографията',
  'Resume text copied — paste it into the application form.':
    'Текстът на автобиографията е копиран — поставете го във формуляра за кандидатстване.',
  'Resume typography': 'Шрифт на автобиографията',
  'Resume, page {page}': 'Автобиография, страница {page}',
  'Resumes skip pronouns: “Launched…”, not “I launched…”.':
    'В автобиографията няма местоимения: „Стартирах…“, а не „Аз стартирах…“.',
  'Retry loading': 'Зареди отново',
  'Retry preview': 'Зареди прегледа отново',
  'Retry saving': 'Запази отново',
  'Reverse chronological order is what readers expect.':
    'Обратният хронологичен ред е това, което читателите очакват.',
  Review: 'Проверка',
  'Review & finish': 'Проверка и край',
  'Rewrite “{text}” to start with an action.':
    'Пренапишете „{text}“ така, че да започва с действие.',
  'Role / organization': 'Роля / организация',
  'Room to strengthen': 'Има какво да се подобри',
  'SIMPLER THAN YOU THINK': 'ПО-ЛЕСНО, ОТКОЛКОТО МИСЛИТЕ',
  STEP: 'СТЪПКА',
  Sans: 'Без серифи',
  Save: 'Запази',
  'Save JSON backup': 'Запази JSON копие',
  'Save backup': 'Запази копие',
  'Saved in this browser': 'Запазено в този браузър',
  'Saving…': 'Запазва се…',
  Sections: 'Раздели',
  Serif: 'Със серифи',
  'Show sections': 'Покажи разделите',
  'Show work you’re proud of.': 'Покажете работа, с която се гордеете.',
  'Skills first · a clear single column': 'Първо уменията · ясна една колона',
  'Skip to content': 'Към съдържанието',
  'Skip “I” and clichés like “team player” or “hard-working”.':
    'Без „аз“ и клишета като „екипен играч“ или „трудолюбив“.',
  'Start a new point in “{entry}”:': 'Започнете нова точка в „{entry}“:',
  'Start a new resume?': 'Да започне ли нова автобиография?',
  'Start date': 'Начална дата',
  'Start my own': 'Започни своя',
  'Start new': 'Започни отначало',
  'Start with a blank page or explore the editor with a filled-in example.':
    'Започнете с празна страница или разгледайте редактора с попълнен пример.',
  'Start with an action: “Launched”, “Improved”, “Built” — then add the outcome.':
    'Започнете с действие: „Стартирах“, „Подобрих“, „Създадох“ — и добавете резултата.',
  'Start with an example': 'Започни с пример',
  'Start with the essentials: who you are and what you do.':
    'Започнете с най-важното: кой сте и с какво се занимавате.',
  'Start with your most recent role. Focus on what you achieved.':
    'Започнете с последната си позиция. Наблегнете на постигнатото.',
  'Strong action verbs': 'Силни глаголи за действие',
  Subject: 'Тема',
  'Take the next step': 'Направете следващата стъпка',
  'Target job title': 'Целева длъжност',
  Teal: 'Тюркоазено',
  'Tell your story': 'Разкажете своята история',
  Template: 'Шаблон',
  Templates: 'Шаблони',
  Terracotta: 'Теракота',
  Text: 'Текст',
  'Text density': 'Плътност на текста',
  'Text size': 'Размер на текста',
  'The file name and the properties that apps and screening systems read. Empty fields are filled from your resume.':
    'Името на файла и свойствата, които четат програмите и системите за подбор. Празните полета се попълват от автобиографията.',
  'The first step is simple.': 'Първата стъпка е лесна.',
  'The title under your name is the first thing matched to a vacancy.':
    'Заглавието под името е първото, което се сравнява с обявата.',
  'The {language} version is empty': 'Версията „{language}“ е празна',
  'This browser could not save your data. Download a JSON backup before leaving.':
    'Браузърът не успя да запази данните. Изтеглете JSON копие, преди да напуснете.',
  'This file exceeds 10 MB. Choose a smaller PDF or JSON file.':
    'Файлът е по-голям от 10 MB. Изберете по-малък PDF или JSON файл.',
  'This is an example': 'Това е пример',
  'This is before the start date.': 'Това е преди началната дата.',
  'Use a phone number with at least six digits.':
    'Въведи телефонен номер с поне шест цифри.',
  'This section has 100 entries. Edit or remove an entry before adding another.':
    'В раздела има 100 записа. Редактирайте или премахнете един, преди да добавите нов.',
  'This will replace your current resume. Save a backup first if you want to return to it later.':
    'Това ще замени текущата автобиография. Първо запазете копие, ако искате да се върнете към нея.',
  'Three sentences: who you are, your strongest proof, what you want next.':
    'Три изречения: кой сте, най-силното доказателство и какво търсите.',
  'Timeless and professional': 'Безвремен и професионален',
  'To improve': 'За подобрение',
  'Toggle color theme': 'Смени цветовата тема',
  'Try an example': 'Вижте пример',
  Undo: 'Отмени',
  'Undo · Ctrl/⌘ Z': 'Отмени · Ctrl/⌘ Z',
  'Untitled resume': 'Автобиография без заглавие',
  'Updating preview…': 'Прегледът се обновява…',
  'Use @ and a domain, like name@mail.com.':
    'Нужни са @ и домейн, например name@mail.com.',
  'Use CEFR levels (A1–C2) or “Native”. Recruiters in Europe filter by them.':
    'Използвайте нивата по CEFR (A1–C2) или „Майчин“. Рекрутърите в Европа филтрират по тях.',
  'Use Undo above to restore removed entries or changes.':
    'С „Отмени“ горе възстановявате премахнати записи или промени.',
  'Use a web address, like linkedin.com/in/name.':
    'Нужен е уеб адрес, например linkedin.com/in/name.',
  'Use automatic values': 'Използвай автоматичните стойности',
  'Use template': 'Използвай шаблона',
  'Use the job title you are applying for, written the way vacancies write it.':
    'Посочете длъжността, за която кандидатствате, така, както е изписана в обявите.',
  'Use the vacancy’s exact terms for skills you really have (React, not “React.js framework”).':
    'Използвайте точните термини от обявата за уменията, които наистина имате (React, а не „рамка React.js“).',
  'Verb groups': 'Групи глаголи',
  'Website or portfolio': 'Сайт или портфолио',
  'What do you do well, and what value do you bring?':
    'В какво сте добри и каква стойност носите?',
  'Which copy do you need?': 'Какво копие Ви трябва?',
  'Without “.pdf” — it is added for you.':
    'Без „.pdf“ — разширението се добавя само.',
  'FREE RESUME BUILDER': 'БЕЗПЛАТЕН КОНСТРУКТОР НА CV',
  'Your data stays with you.': 'Данните Ви остават при Вас.',
  'Your experience.': 'Вашият опит.',
  'Your experience. At your pace.': 'Вашият опит. С Вашето темпо.',
  'Your full name': 'Вашето име и фамилия',
  'Your local data has not been changed. Try loading it again or open your PDF / JSON backup.':
    'Локалните Ви данни не са променени. Опитайте да ги заредите отново или отворете PDF / JSON копието си.',
  'Your name': 'Вашето име',
  'Your name plus an email or phone number.': 'Вашето име и имейл или телефон.',
  'Your professional profile': 'Вашият професионален профил',
  'Your resume is stored only in this browser. Clearing browser data removes the local copy, so keep an editable PDF or JSON backup.':
    'Автобиографията се пази само в този браузър. Изчистването на данните на браузъра изтрива локалното копие, затова пазете редактируемо PDF или JSON копие.',
  'Your resume, no strings attached.': 'Вашата автобиография, без уловки.',
  'Your skills': 'Вашите умения',
  'Your story stays yours': 'Вашата история остава ваша',
  'Your story. Your data. Your next chapter.':
    'Вашата история. Вашите данни. Вашата следваща глава.',
  'Your story. Your style.': 'Вашата история. Вашият стил.',
  'Zoom in': 'Увеличи',
  'Zoom out': 'Намали',
  '[Action verb] [what you did], [result with a number] by [how].':
    '[Глагол за действие] [какво направихте], [резултат с число] чрез [как].',
  '[Job title] with [N] years of experience in [field]. [Strongest result with a number]. Looking for [the role or team you want].':
    '[Длъжност] с [N] години опит в [област]. [Най-силният резултат с число]. Търси [желаната роля или екип].',
  'best.': 'си вид.',
  'e.g. Berlin, Germany': 'напр. Берлин, Германия',
  'e.g. Product designer': 'напр. Продуктов дизайнер',
  'great presentation.': 'добро представяне.',
  'key skills from the posting appear in your resume.':
    'ключови умения от обявата има в автобиографията Ви.',
  'main column': 'основна колона',
  'move down': 'надолу',
  'move up': 'нагоре',
  'sections filled': 'попълнени раздела',
  'show in PDF': 'показвай в PDF',
  'side column': 'странична колона',
  'to a fresh start.': 'до ново начало.',
  '{label}: an end date is before its start date. Check the dates.':
    '{label}: крайна дата е преди началната. Проверете датите.',
  '{label}: fill in the empty entry or remove it.':
    '{label}: попълнете празния запис или го премахнете.',
  '{label}: split long paragraphs into shorter points.':
    '{label}: разделете дългите абзаци на по-кратки точки.',
  '{measured} of {total} points include a number. Aim for at least half.':
    '{measured} от {total} точки съдържат число. Целта е поне половината.',
  '{passed} of {total} content checks passed. These help human readers and screening systems; they are not a universal ATS score.':
    '{passed} от {total} проверки на съдържанието са успешни. Те помагат на читателите и на системите за подбор; не са универсален ATS резултат.',
  '{title}: {position} of {total}': '{title}: {position} от {total}',
  '“{text}” proves nothing — show it with a fact instead.':
    '„{text}“ не доказва нищо — покажете го с факт.',
  ' — home': ' — начало',
  'Made by': 'Създадено от',
  'Action verbs': 'Глаголи за действие',
  'Add a certificate when you have one: IELTS, TOEFL, Goethe, TestDaF, DELE.':
    'Ако имате сертификат, посочете го: IELTS, TOEFL, Goethe, TestDaF, DELE.',
  'Added skills': 'Добавени умения',
  'All suggestions added.': 'Всички предложения са добавени.',
  'Another skill…': 'Още умение…',
  'BSc Computer Science · TU Berlin · 2016–2020 · Thesis on real-time collaborative editing':
    'Бакалавър, информатика · Софийски университет · 2016–2020 · Дипломна работа за съвместно редактиране в реално време',
  'Choose a language': 'Изберете език',
  'Choose how your resume looks. You can switch at any time — your text stays.':
    'Изберете как да изглежда автобиографията. Може да го смените по всяко време — текстът остава.',
  'Color and type': 'Цвят и шрифт',
  'Communication, teamwork, MS Office, hard-working':
    'Комуникативност, работа в екип, MS Office, трудолюбие',
  'Computer science graduate who built three web apps used by 2,000 students. Looking for a junior frontend role in a product team.':
    'Завършил информатика, създал три уеб приложения, които използват 2000 студенти. Търся junior позиция във фронтенда в продуктов екип.',
  Data: 'Данни',
  Development: 'Разработка',
  'English — C1 (IELTS 7.5)': 'Английски — C1 (IELTS 7,5)',
  'English — good': 'Английски — добър',
  'Enter or a comma adds a skill. Use the vacancy’s wording, and only skills you really have.':
    'Enter или запетая добавят умение. Пишете като в обявата и само умения, които наистина имате.',
  'Example text — your own text will replace it':
    'Примерен текст — вашият текст ще го замени',
  Examples: 'Примери',
  Field: 'Сфера',
  Finance: 'Финанси',
  HR: 'HR',
  'Helped with recruiting.': 'Помагах с подбора на персонал.',
  'Hide from resume': 'Скрий от автобиографията',
  'Hired 14 engineers in six months and cut time to hire from 52 to 31 days.':
    'Наех 14 инженери за шест месеца и съкратих срока за наемане от 52 на 31 дни.',
  'How to write: {section}': 'Как да попълните: {section}',
  'In resume': 'В автобиографията',
  'Language name': 'Име на езика',
  'Level in your own words': 'Ниво със свои думи',
  'Managed 25 key accounts worth €1.2M a year and kept 96% of them at renewal.':
    'Управлявах 25 ключови клиента с оборот 1,2 млн. € годишно, 96% подновиха договора.',
  Marketing: 'Маркетинг',
  'Meal planner (React, Supabase): 1,200 monthly users plan a week of meals in three clicks instead of twelve. Live demo and code linked.':
    'Планер за меню (React, Supabase): 1200 потребители месечно планират седмицата с три клика вместо дванадесет. Връзки към демо и код.',
  Office: 'Офис',
  'Often listed in {field}:': 'Често в сферата „{field}“:',
  Operations: 'Операции',
  'Other…': 'Друг…',
  'PDF file properties': 'Свойства на PDF файла',
  'PDF pages — drag or scroll to explore':
    'PDF страници — плъзнете или превъртете',
  'Personal website.': 'Личен сайт.',
  Product: 'Продукт',
  'React, TypeScript, Node.js, PostgreSQL, Figma, Accessibility (WCAG 2.2), Jest, CI/CD':
    'React, TypeScript, Node.js, PostgreSQL, Figma, достъпност (WCAG 2.2), Jest, CI/CD',
  'Recent graduate looking for any job in IT.':
    'Завършил, търся каквато и да е работа в IT.',
  'Remove “{skill}”': 'Премахни „{skill}“',
  Sales: 'Продажби',
  'Section order and visibility': 'Ред и видимост на разделите',
  'Senior Frontend Developer (React, TypeScript)':
    'Senior фронтенд разработчик (React, TypeScript)',
  'Show in resume': 'Покажи в автобиографията',
  'Show it': 'Покажи',
  Specialist: 'Специалист',
  'Steps done; hidden sections are not counted':
    'Готови стъпки; скритите раздели не се броят',
  Structure: 'Структура',
  'Suggested skills': 'Предложени умения',
  'Suggestions by field:': 'Предложения по сфера:',
  Support: 'Поддръжка',
  'This section is hidden and won’t appear in your PDF. What you entered is kept.':
    'Разделът е скрит и няма да се появи в PDF. Въведеното се запазва.',
  'University, 2016–2020': 'Университет, 2016–2020',
  'Worked with clients.': 'Работех с клиенти.',
  'You can add a certificate: “C1 (IELTS 7.5)”.':
    'Може да добавите сертификат: „C1 (IELTS 7,5)“.',
  'e.g. Figma, then Enter': 'напр. Figma, после Enter',
  'ivan.petrov.1990@mail.com · Berlin, Hauptstraße 5, flat 12':
    'ivan.petrov.1990@mail.bg · София, ул. Витоша 5, ап. 12',
  'ivan.petrov@mail.com · Berlin, Germany · linkedin.com/in/ivanpetrov':
    'ivan.petrov@mail.bg · София, България · linkedin.com/in/ivanpetrov',
  '{section} in resume': '„{section}“ в автобиографията',
  'Something went wrong': 'Нещо се обърка',
  'Your resume is saved in this browser and nothing is lost. Reload the page — or download a copy first.':
    'Автобиографията ви е запазена в този браузър и нищо не е изгубено. Презаредете страницата — или първо изтеглете копие.',
  Reload: 'Презареди',
  'Download a copy (JSON)': 'Изтегли копие (JSON)',
  'Report the problem': 'Съобщете за проблема',
  'Report a problem': 'Съобщете за проблем',
  'JSON backup downloaded. Open it here to restore your resume.':
    'JSON копието е изтеглено. Отвори го тук, за да възстановиш автобиографията си.',
  'Could not download the backup. Try again; your resume is still here.':
    'Копието не можа да се изтегли. Опитай отново; автобиографията ти остава тук.',
  'MADE BY A PERSON': 'ЛИЧЕН ПРОЕКТ',
  'The developer behind NeatCV.': 'Разработчикът на NeatCV.',
  'A good resume shouldn’t end at a checkout.':
    'Доброто CV не трябва да завършва с екран за плащане.',
  'I built NeatCV so you can focus on your experience, make a clear resume and download it without a last-minute payment screen.':
    'Създадох NeatCV, за да се съсредоточите върху опита си, да оформите ясно CV и да го изтеглите без неочаквано искане за плащане.',
  'This is my personal project. There is no paid tier: every template, editing feature and PDF download is free, without watermarks or an account. Your resume stays in your browser.':
    'Това е мой личен проект. Няма платен план: всички шаблони, функции за редактиране и PDF изтегляния са безплатни, без водни знаци или регистрация. CV-то ви остава в браузъра.',
  'See the source on GitHub': 'Кодът в GitHub',
  'Sentry integration is prepared and stays disabled without a valid DSN. When configured, error reports contain only an error category, a safe page route, loaded application asset names, line and column positions, and generated report identifiers and timestamps. Resume text, arbitrary error messages, names, contacts, photos, file names, URL queries, browser breadcrumbs and attachments are excluded. There is no session replay or automatic performance recording. Do Not Track and Global Privacy Control prevent reporting.':
    'Интеграцията със Sentry е подготвена и остава изключена без валиден DSN. След настройване отчетите съдържат само категория на грешката, безопасен маршрут, имена на заредени файлове на приложението, позиции на ред и колона, генерирани идентификатори и време. Текстът на CV-то, произволни съобщения за грешки, имена, контакти, снимки, имена на лични файлове, URL параметри, история на действията и прикачени файлове са изключени. Няма запис на сесии или автоматично проследяване на производителността. Do Not Track и Global Privacy Control блокират отчетите.',
  'The configured reporting host receives connection data, including IP address and browser request headers. Region and retention depend on that Sentry project; these settings must be reviewed before activation. No resume content is included.':
    'Настроеният получател получава данни за връзката, включително IP адрес и заглавки на заявките на браузъра. Регионът и срокът за съхранение зависят от проекта в Sentry и трябва да се проверят преди включване. Съдържанието на CV-то не се изпраща.',
  'Reporting host: {host}': 'Получател на отчетите: {host}',
}
export default messages
