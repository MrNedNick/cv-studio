const messages: Record<string, string> = {
  'Your resume stays on your device.':
    'Tu currículum permanece en tu dispositivo.',
  'This notice explains how NeatCV handles your resume, browser storage and optional services.':
    'Aquí explicamos cómo NeatCV trata tu currículum, el almacenamiento del navegador y los servicios opcionales.',
  'Updated: 6 October 2026': 'Actualizado: 6 de octubre de 2026',
  'On this page': 'En esta página',
  'Resume and files': 'Currículum y archivos',
  'Editing, importing files, cropping your photo and generating PDFs happen in your browser. NeatCV does not upload your resume or require an account. The local resume is saved in IndexedDB.':
    'La edición, la importación de archivos, el recorte de fotos y la creación de PDF se realizan en tu navegador. NeatCV no sube tu currículum a un servidor ni exige una cuenta. La copia local se guarda en IndexedDB.',
  'Sharing PDFs contain the selected language. Editable PDFs and JSON backups also contain every language version and design settings, including content hidden from the sharing PDF. Keep those backups for yourself. You choose who receives downloaded files.':
    'Los PDF para compartir contienen el idioma elegido. Los PDF editables y las copias JSON incluyen todos los idiomas y ajustes de diseño, también el contenido oculto en el PDF para compartir. Guarda esas copias para ti. Tú eliges quién recibe los archivos descargados.',
  'Browser storage': 'Almacenamiento del navegador',
  'Language, theme, editor layout, guidance preferences and a pasted job posting are stored locally. They remain until you clear site data or your browser removes them. The app does not use advertising cookies.':
    'El idioma, el tema, la disposición del editor, las preferencias de ayuda y la oferta de empleo pegada se guardan localmente hasta que tú o el navegador borren los datos del sitio. La app no utiliza cookies publicitarias.',
  'Source labels': 'Etiquetas de origen',
  'Links with ?ref=reddit or similar labels help measure where visits come from. The first and latest valid labels, platform and timestamps are stored separately from your resume for 30 days. Untagged returns do not renew that period. Labels never enter resume backups.':
    'Los enlaces con ?ref=reddit u otras etiquetas ayudan a medir el origen de las visitas. La primera y la última etiqueta válidas, la plataforma y las fechas se guardan aparte del currículum durante 30 días. Volver sin etiqueta no amplía ese plazo. Las copias del currículum no incluyen etiquetas.',
  'Umami · usage analytics': 'Umami · estadísticas de uso',
  'Prepared · currently disabled': 'Preparado · desactivado actualmente',
  'Configured in this build': 'Configurado en esta versión',
  'Umami is optional and requires a configured website ID. If enabled, it receives visits and successful resume creation, example, import and download events, with source labels, language, template and file format where relevant. Our event code excludes resume text, names, contacts, photos, file names and full URL queries.':
    'Umami es opcional y necesita un ID del sitio configurado. Si se activa, recibe visitas y eventos completados de creación, ejemplo, importación y descarga, con origen, idioma, plantilla y formato cuando corresponda. Nuestro código excluye el texto del currículum, nombres, contactos, fotos, nombres de archivos y consultas completas de URL.',
  'A receiving analytics service also receives connection information such as your IP address. Reports may include browser, device and approximate country. NeatCV does not configure session replay or cross-site user identification.':
    'El servicio receptor también recibe datos de conexión como la dirección IP. Los informes pueden incluir navegador, dispositivo y país aproximado. NeatCV no configura grabación de sesiones ni identificación de usuarios entre sitios.',
  'Umami uses no tracking cookies. Do Not Track and Global Privacy Control prevent its tracker loading and event transmission in NeatCV. When no valid ID is configured, no Umami requests are made.':
    'Umami no utiliza cookies de seguimiento. Do Not Track y Global Privacy Control impiden cargar el rastreador y enviar eventos en NeatCV. Sin un ID válido no se hacen solicitudes a Umami.',
  'Umami privacy notice': 'Política de privacidad de Umami',
  'Sentry · error reporting': 'Sentry · informes de errores',
  'Sentry data collection documentation':
    'Documentación de recopilación de datos de Sentry',
  'Hosting and external links': 'Alojamiento y enlaces externos',
  'GitHub Pages serves this website and its fonts. GitHub logs visitor IP addresses for security, independently of optional analytics. These hosting logs are governed by GitHub’s privacy statement.':
    'GitHub Pages sirve este sitio y sus fuentes. GitHub registra direcciones IP de visitantes por seguridad, independientemente de las estadísticas opcionales. Esos registros se rigen por la declaración de privacidad de GitHub.',
  'GitHub, LinkedIn and other external links open services with their own privacy practices. Information you choose to send there is handled by those services. Do not include private resume details in public issue reports.':
    'GitHub, LinkedIn y otros enlaces externos llevan a servicios con sus propias prácticas de privacidad. Esos servicios tratan lo que decidas enviarles. No incluyas datos privados del currículum en informes públicos de errores.',
  'GitHub privacy statement': 'Declaración de privacidad de GitHub',
  'Your choices': 'Tus opciones',
  'Save an editable PDF or JSON backup before clearing browser data. To remove the local resume, preferences and source labels, clear site data for neatcv.cc in your browser settings. This does not delete downloaded files; manage those on your device.':
    'Guarda una copia editable en PDF o JSON antes de borrar los datos del navegador. Para eliminar el currículum local, las preferencias y las etiquetas, borra los datos de neatcv.cc en los ajustes del navegador. Los archivos descargados permanecen en tu dispositivo.',
  'Contact and updates': 'Contacto y actualizaciones',
  'NeatCV is made by Nikita Nedyalkov. For privacy questions, contact Nikita on LinkedIn. This notice will be updated before new services or materially different data processing are introduced.':
    'NeatCV es obra de Nikita Nedyalkov. Para preguntas sobre privacidad, contacta con Nikita en LinkedIn. Este aviso se actualizará antes de introducir nuevos servicios o cambios sustanciales en el tratamiento de datos.',
  'Back to NeatCV': 'Volver a NeatCV',
  Privacy: 'Privacidad',
  'Your resume stays in your browser':
    'Tu currículum permanece en tu navegador',
  'Privacy — opens in a new tab': 'Privacidad — abre una pestaña nueva',
  'Link targets to check: {count}': 'Destinos de enlaces por revisar: {count}',
  'Use an email with @ and a domain. This address will appear in the PDF without a link.':
    'Usa un correo con @ y un dominio. Esta dirección aparecerá en el PDF sin enlace.',
  'Use an http or https address, like example.com. This link will be left out of the PDF.':
    'Usa una dirección http o https, como example.com. Este enlace se omitirá del PDF.',
  'Edit {section}': 'Editar {section}',
  'Text to check': 'Texto por revisar',
  'These passages were not found in the extracted PDF text. Check them in the PDF tab or edit the section.':
    'Estos fragmentos no se encontraron en el texto extraído del PDF. Revísalos en la pestaña PDF o edita la sección.',
  'Passages not found: {count}': 'Fragmentos no encontrados: {count}',
  'Page {page}: text may extend past the paper edge. Try a smaller text size or another template and check the PDF tab.':
    'Página {page}: el texto podría sobresalir del borde. Prueba un tamaño de texto menor u otra plantilla y revisa la pestaña PDF.',
  'Passages at the edge: {count}': 'Fragmentos en el borde: {count}',
  'No missing passages or text outside the paper edges found.':
    'No se encontraron fragmentos ausentes ni texto fuera de los bordes.',
  'Check PDF text': 'Comprobar texto del PDF',
  'Text extracted from PDF': 'Texto extraído del PDF',
  'Check the reading order and links in the actual PDF. Everything runs in your browser.':
    'Comprueba el orden de lectura y los enlaces del PDF real. Todo funciona en tu navegador.',
  'Checking PDF text…': 'Comprobando texto del PDF…',
  'Could not read the PDF text. Try again.':
    'No se pudo leer el texto del PDF. Inténtalo de nuevo.',
  'This page has no extractable text. Check it in the PDF tab.':
    'Esta página no tiene texto extraíble. Compruébala en la pestaña PDF.',
  'Links in PDF': 'Enlaces del PDF',
  'No links on this page.': 'No hay enlaces en esta página.',
  'Hide form · Ctrl/⌘ \\': 'Ocultar formulario · Ctrl/⌘ \\',
  'Show form · Ctrl/⌘ \\': 'Mostrar formulario · Ctrl/⌘ \\',
  'Add your name and role': 'Añade tu nombre y puesto',
  'Click the name field, then add your role below. Edits save automatically in this browser.':
    'Haz clic en el campo del nombre y añade tu puesto debajo. Los cambios se guardan automáticamente en este navegador.',
  'Open the writing examples for help describing your experience and results. Hide an unneeded section without deleting its text.':
    'Abre los ejemplos para describir tu experiencia y resultados. Oculta una sección innecesaria sin borrar su texto.',
  'Check the gaps above. Optionally paste a vacancy here to compare skills. Then inspect the PDF and keep both copies.':
    'Revisa los datos que faltan arriba. Si quieres, pega una oferta aquí para comparar habilidades. Después revisa el PDF y guarda ambas copias.',
  'Check the actual PDF pages. Click Text for reading and copying. Download a sharing copy and keep an editable copy for yourself.':
    'Revisa las páginas del PDF real. Pulsa Texto para leer y copiar. Descarga una copia para compartir y guarda una copia editable.',
  'Skip walkthrough': 'Omitir recorrido',
  'Continue walkthrough': 'Continuar recorrido',
  'Walk me through the editor': 'Mostrar el editor paso a paso',
  'Start walkthrough': 'Iniciar recorrido',
  'The preview shows example text until you write your own. Choose a look, then Personal details.':
    'La vista previa muestra un ejemplo hasta que escribas tu texto. Elige un diseño y pasa a Datos personales.',
  'Each language has its own text; nothing is translated automatically. Contacts, dates and links are shared.':
    'Cada idioma tiene su propio texto; no hay traducción automática. Los contactos, fechas y enlaces son comunes.',
  'Enter or comma adds a skill. Paste a comma-separated list to add several at once.':
    'Enter o coma añade una habilidad. Pega una lista separada por comas para añadir varias a la vez.',
  'Choose a level from A1–C2 or write your own. These are languages you speak, not the PDF language.':
    'Elige un nivel A1–C2 o descríbelo con tus palabras. Estas son las lenguas que hablas, no el idioma del PDF.',
  'Add several skills at once': 'Añade varias habilidades a la vez',
  'Another language, a separate version': 'Otro idioma, otra versión',
  'Choose a level that fits': 'Elige el nivel adecuado',
  'Choose what you need help with. You can write and download in any order; completing every step is optional.':
    'Elige en qué necesitas ayuda. Puedes escribir y descargar en cualquier orden; no es necesario completar todos los pasos.',
  'Contextual editor tips': 'Consejos durante la edición',
  'Dismiss this editor tip': 'No volver a mostrar este consejo',
  'Editor guide': 'Ayuda del editor',
  'Editor tip': 'Consejo del editor',
  'Keep only the sections you need': 'Conserva solo las secciones necesarias',
  'Restore dismissed editor tips': 'Restaurar consejos descartados',
  'Review, then keep two copies': 'Revisa y guarda dos copias',
  'See what the reader will see': 'Mira lo que verá quien lo lea',
  'Show in editor': 'Mostrar en el editor',
  'Start with the look': 'Empieza por el diseño',
  'Checks help you spot gaps; they do not rate your chances of getting hired. Inspect the PDF, download For sharing for employers, and keep an Editable copy for yourself to reopen here and continue editing.':
    'Las comprobaciones ayudan a detectar omisiones; no valoran tus posibilidades de contratación. Revisa el PDF, descarga Para compartir para las empresas y guarda una Copia editable para abrirla aquí y seguir editando.',
  'Choose a language and level. A1–A2 is basic, B1–B2 independent, C1–C2 proficient. You can describe the level in your own words. These are languages you speak; the PDF language is selected at the top.':
    'Elige un idioma y nivel. A1–A2 es básico, B1–B2 independiente y C1–C2 competente. También puedes describir tu nivel con tus palabras. Estas son las lenguas que hablas; el idioma del PDF se elige arriba.',
  'Do not need this section? Turn off In resume: your text is kept and Next skips this step. Open How to write this section for structure and examples. Collapsing an entry keeps it in the PDF.':
    '¿No necesitas esta sección? Desactiva En el currículum: el texto se conserva y Siguiente salta este paso. Abre Cómo escribir esta sección para ver estructuras y ejemplos. Contraer una entrada no la elimina del PDF.',
  'Edits save automatically. They will not appear on another device, and clearing browser data removes this copy. When you finish, keep an editable PDF or use the actions menu to save JSON.':
    'Los cambios se guardan automáticamente. No aparecerán en otro dispositivo y borrar los datos del navegador elimina esta copia. Al terminar, guarda un PDF editable o usa el menú de acciones para guardar JSON.',
  'Pick a template, then move to Personal details. While your resume is empty, the preview uses example text; it is not added to your resume. On a phone, open Preview to see the design.':
    'Elige una plantilla y pasa a Datos personales. Mientras tu currículum esté vacío, la vista previa muestra un ejemplo que no se añade a tu currículum. En el móvil, abre Vista previa para ver el diseño.',
  'The language selector at the top changes the interface and resume version. Text is not translated automatically; an empty version can copy another as a starting point. Contacts, dates and links are shared. Sharing PDFs contain the selected version.':
    'El selector de idioma de arriba cambia la interfaz y la versión del currículum. El texto no se traduce automáticamente; puedes copiar otra versión para empezar una vacía. Los contactos, fechas y enlaces son comunes. El PDF para compartir contiene la versión elegida.',
  'This is the actual PDF: check every page and line break. Text view is useful for reading and copying. Zoom changes only the preview, not the text size in the file. Change text size in the Template step.':
    'Este es el PDF real: revisa todas las páginas y saltos de línea. La vista Texto facilita la lectura y la copia. El zoom solo cambia la vista previa, no el tamaño del texto del archivo. Cambia el tamaño en el paso Plantilla.',
  'Type a skill and press Enter or comma. You can paste a list separated by commas. Suggestions below are optional; add only skills you actually have.':
    'Escribe una habilidad y pulsa Enter o coma. Puedes pegar una lista separada por comas. Las sugerencias son opcionales; añade solo habilidades que tengas.',
  'Could not load this language. Reload and try again.':
    'No se pudo cargar este idioma. Recarga la página e inténtalo de nuevo.',
  '1–2 pages': '1–2 páginas',
  '6–30 skills': '6–30 habilidades',
  'A FORMAT FOR YOUR STORY': 'UN FORMATO PARA TU HISTORIA',
  'A beautiful resume, without the busywork. Add your experience, choose a style, and download your PDF. All for free.':
    'Un currículum bonito, sin trabajo pesado. Añade tu experiencia, elige un estilo y descarga tu PDF. Todo gratis.',
  'A big name and confident headings':
    'Un nombre grande y títulos con carácter',
  'A blank resume': 'Currículum en blanco',
  'A bold header over calm, clear text':
    'Una cabecera llamativa sobre un texto claro y sereno',
  'A considered first impression': 'Una primera impresión cuidada',
  'A distinctive two-column layout':
    'Un diseño a dos columnas con personalidad',
  'A few focused sentences about your experience and strengths.':
    'Unas frases concretas sobre tu experiencia y tus puntos fuertes.',
  'A single-column template is a safer choice for automated screening.':
    'Para la selección automatizada, una plantilla de una columna es la opción más segura.',
  'A solid base': 'Una buena base',
  'A start month and year for each entry; screening systems rely on them.':
    'Mes y año de inicio en cada entrada: los sistemas de selección dependen de ellos.',
  'A strong resume': 'Un currículum sólido',
  'About {count} words now. Keep what matters for this role.':
    'Ahora tiene unas {count} palabras. Quédate con lo que importa para este puesto.',
  'Accent color': 'Color de acento',
  'Achievements and impact': 'Logros e impacto',
  'Add LinkedIn and a portfolio or GitHub link. Recruiters open them before calling.':
    'Añade LinkedIn y un enlace a tu portfolio o GitHub. Los reclutadores los abren antes de llamar.',
  'Add an email or phone number so people can contact you.':
    'Añade un correo o un teléfono para que puedan contactarte.',
  'Add an entry to insert verbs:': 'Añade una entrada para insertar verbos:',
  'Add an entry, or skip this section.':
    'Añade una entrada u omite esta sección.',
  'Add entry': 'Añadir entrada',
  'Add measurable outcomes to your experience: numbers, time saved, or scale.':
    'Añade resultados medibles a tu experiencia: cifras, tiempo ahorrado o alcance.',
  'Add only what you genuinely have — ideally in skills and in an experience point.':
    'Añade solo lo que dominas de verdad, idealmente en habilidades y en un punto de tu experiencia.',
  'Add photo': 'Añadir foto',
  'Add points that include numbers.': 'Añade puntos que incluyan cifras.',
  'Add to skills': 'Añadir a habilidades',
  'Add your education and relevant courses.':
    'Añade tu formación y cursos relevantes.',
  'Add your name so your resume is easy to identify.':
    'Añade tu nombre para que tu currículum sea fácil de identificar.',
  After: 'Después',
  'Aim for 2–4 specific sentences. Skip generic buzzwords.':
    'Entre 2 y 4 frases concretas. Evita las palabras de moda.',
  'Aim for numbers in at least half of the points: %, money, time, users, team size.':
    'Cifras en al menos la mitad de los puntos: %, dinero, tiempo, usuarios, tamaño del equipo.',
  'All templates, downloads, and editing are available without sign-up, subscriptions, or watermarks.':
    'Todas las plantillas, descargas y ediciones están disponibles sin registro, suscripciones ni marcas de agua.',
  'Already covered': 'Ya incluido',
  'At its': 'En su',
  'At least 3 achievement points for your most recent job.':
    'Al menos 3 logros para tu empleo más reciente.',
  Author: 'Autor',
  Back: 'Atrás',
  'Back to editing': 'Volver a editar',
  Before: 'Antes',
  Blue: 'Azul',
  'Both options are free, with no watermarks. Your data stays on your device.':
    'Ambas opciones son gratis y sin marcas de agua. Tus datos se quedan en tu dispositivo.',
  'Briefly: who you are, your best result, what you want next.':
    'En breve: quién eres, tu mejor resultado y qué buscas.',
  Build: 'Crear',
  Burgundy: 'Burdeos',
  'By default these come from your name, job title, and skills. Change them under Design → PDF. Metadata describes the file; it does not guarantee a screening rank.':
    'Por defecto salen de tu nombre, puesto y habilidades. Puedes cambiarlos en Diseño → PDF. Los metadatos describen el archivo; no garantizan una posición en la selección.',
  'CONTACT DETAILS': 'DATOS DE CONTACTO',
  Cancel: 'Cancelar',
  'Centered and composed for senior roles':
    'Centrada y sobria para puestos sénior',
  'Certificates that a vacancy names belong here too.':
    'Los certificados que menciona una oferta también van aquí.',
  'Change the interface language at the top of the page and the resume language next to the document name. A resume can have up to six language versions: you translate the text; contacts, dates, and links are shared. The PDF shows the selected version.':
    'Cambia el idioma de la interfaz arriba en la página y el del currículum junto al nombre del documento. Un currículum puede tener hasta seis versiones de idioma: tú traduces el texto; los contactos, fechas y enlaces se comparten. El PDF muestra la versión elegida.',
  'Check the name and file, then continue editing.':
    'Revisa el nombre y el archivo y sigue editando.',
  'Check your email: include @ and a domain.':
    'Revisa tu correo: debe incluir @ y un dominio.',
  'Check your website link. Use an http or https address.':
    'Revisa el enlace a tu web. Usa una dirección http o https.',
  'Choose what feels like you. Switch templates any time without losing a word.':
    'Elige lo que va contigo. Cambia de plantilla cuando quieras sin perder ni una palabra.',
  'Choose your template and color. See every change in the live preview.':
    'Elige plantilla y color. Ve cada cambio en la vista previa.',
  'Choose “Editable copy” when downloading to include every language version and the design settings. Use “Open file” to restore that copy. “For sharing” contains only the selected language and cannot be reopened for editing.':
    'Al descargar, elige «Copia editable» para incluir todas las versiones de idioma y el diseño. Usa «Abrir archivo» para recuperar esa copia. «Para enviar» contiene solo el idioma elegido y no puede volver a editarse.',
  'City and country': 'Ciudad y país',
  'City and country are enough. A full street address is not needed.':
    'Basta con la ciudad y el país. No hace falta la dirección completa.',
  'Classic serif typography, centered':
    'Tipografía clásica con serifa, centrada',
  'Classic uses a timeless monochrome palette.':
    'Classic usa una paleta monocromática atemporal.',
  'Clear everything': 'Borrar todo',
  Close: 'Cerrar',
  'Collapse all': 'Contraer todo',
  Comfortable: 'Holgada',
  'Common in Germany, Austria and Switzerland. Usually left out in the US, UK and Canada.':
    'Habitual en Alemania, Austria y Suiza. En EE. UU., Reino Unido y Canadá normalmente se omite.',
  Compact: 'Compacta',
  Company: 'Empresa',
  'Concise points': 'Puntos concisos',
  'Continue your resume': 'Continuar tu currículum',
  'Copy as plain text': 'Copiar como texto plano',
  'Copy from': 'Copiar de',
  'Copy text': 'Copiar texto',
  'Copy the text from another version and translate it, or start from scratch. Contacts and dates are already shared.':
    'Copia el texto de otra versión y tradúcelo, o empieza desde cero. Los contactos y las fechas ya se comparten.',
  'Could not create the PDF. Retry the download, or return to editing and save a JSON backup from the menu.':
    'No se pudo crear el PDF. Vuelve a intentar la descarga, o vuelve al editor y guarda una copia JSON desde el menú.',
  'Could not create the PDF. Try again or save a JSON backup.':
    'No se pudo crear el PDF. Inténtalo de nuevo o guarda una copia JSON.',
  'Could not open that image. Choose a JPG, PNG or WebP up to 15 MB.':
    'No se pudo abrir la imagen. Elige un JPG, PNG o WebP de hasta 15 MB.',
  'Could not open this file. Choose JSON Resume or an editable PDF copy from NeatCV (up to 10 MB). Sharing copies and other PDFs do not include editable source.':
    'No se pudo abrir este archivo. Elige un JSON Resume o una copia PDF editable de NeatCV (hasta 10 MB). Las copias para enviar y otros PDF no incluyen la fuente editable.',
  'Could not open your saved resume': 'No se pudo abrir tu currículum guardado',
  'Create your resume': 'Crea tu currículum',
  'Ctrl / ⌘ Z to undo; Ctrl / ⌘ Shift Z to redo; Ctrl / ⌘ S to save a JSON backup. Guidance below the form takes you to the section to review.':
    'Ctrl / ⌘ Z para deshacer; Ctrl / ⌘ Mayús Z para rehacer; Ctrl / ⌘ S para guardar una copia JSON. Las sugerencias bajo el formulario te llevan a la sección que revisar.',
  'Dates for jobs and studies': 'Fechas de empleos y estudios',
  'Dates in the margin, career at a glance':
    'Fechas en el margen, la trayectoria de un vistazo',
  'Degree / field of study': 'Título / área de estudio',
  'Degree, institution and years. Recent graduates can add relevant courses or a thesis.':
    'Título, centro y años. Si te has graduado hace poco, añade cursos relevantes o tu trabajo final.',
  'Delete this entry': 'Eliminar esta entrada',
  Description: 'Descripción',
  Design: 'Diseño',
  'Dismiss notification': 'Cerrar notificación',
  'Document title': 'Título del documento',
  Done: 'Hecho',
  Download: 'Descargar',
  'Download .txt for forms': 'Descargar .txt para formularios',
  'Download PDF': 'Descargar PDF',
  'Download a PDF with selectable text. Come back and edit whenever you need.':
    'Descarga un PDF con texto seleccionable. Vuelve y edítalo cuando lo necesites.',
  'Download it. Keep it editable.': 'Descárgalo. Sigue pudiendo editarlo.',
  'Download the PDF, then check that text copies and links open.':
    'Descarga el PDF y comprueba que el texto se copia y los enlaces se abren.',
  'Download your resume': 'Descarga tu currículum',
  'Drag to resize. Double-click to reset.':
    'Arrastra para cambiar el ancho. Doble clic para restablecer.',
  'EVERY TEMPLATE IS FREE': 'TODAS LAS PLANTILLAS SON GRATIS',
  'Editable copies can be reopened.':
    'Las copias editables se pueden volver a abrir.',
  'Editable copy': 'Copia editable',
  'Editable copy downloaded. Open it here to restore every language version and the design settings.':
    'Copia editable descargada. Ábrela aquí para recuperar todas las versiones de idioma y el diseño.',
  Editor: 'Editor',
  Email: 'Correo electrónico',
  'End date': 'Fecha de fin',
  English: 'Inglés',
  Entries: 'Entradas',
  'Every template and feature is free':
    'Todas las plantillas y funciones son gratis',
  'Expand all': 'Expandir todo',
  'Explore templates': 'Ver plantillas',
  'File name': 'Nombre del archivo',
  'Fill in the sections at your own pace. Your changes save automatically.':
    'Rellena las secciones a tu ritmo. Los cambios se guardan automáticamente.',
  'Fit page': 'Página completa',
  'Fit to width': 'Ajustar al ancho',
  'For automated resume screening, choose any template except the two-column Editorial: the others read top to bottom.':
    'Para la selección automatizada, elige cualquier plantilla salvo Editorial, de dos columnas: las demás se leen de arriba abajo.',
  'For reading and copying. See the PDF tab for the document layout.':
    'Para leer y copiar. El diseño del documento está en la pestaña PDF.',
  'For sharing': 'Para enviar',
  Forest: 'Bosque',
  Form: 'Formulario',
  'Form width': 'Ancho del formulario',
  'Formula: action verb + what you did + measurable result (Google’s X‑Y‑Z).':
    'Fórmula: verbo de acción + qué hiciste + resultado medible (la X‑Y‑Z de Google).',
  'Free PDF download': 'Descarga del PDF gratis',
  'Free from the first word to the final PDF.':
    'Gratis desde la primera palabra hasta el PDF final.',
  'Free. That’s the whole story.': 'Gratis. Y eso es todo.',
  'Frequent in the posting': 'Frecuente en la oferta',
  'From a blank page': 'De una página en blanco',
  'Frontend engineer with 6 years in Vue and React. Cut page load time by 45% for 2M monthly users. Looking for a product team building complex interfaces.':
    'Ingeniero frontend con 6 años en Vue y React. Redujo un 45 % el tiempo de carga para 2 millones de usuarios al mes. Busca un equipo de producto que cree interfaces complejas.',
  'Full PDF page': 'Página PDF completa',
  'Full name': 'Nombre completo',
  'Get a feel for how it works.': 'Descubre cómo funciona.',
  'Good design, for everyone': 'Buen diseño, para todos',
  'Got it': 'Entendido',
  Graphite: 'Grafito',
  'Great experience deserves': 'Una gran experiencia merece',
  Grow: 'Crecer',
  'Hard-working team player looking for new challenges.':
    'Trabajador y con espíritu de equipo, busco nuevos retos.',
  'Hide sections': 'Ocultar secciones',
  'How it works': 'Cómo funciona',
  'How to write this section': 'Cómo rellenar esta sección',
  Improve: 'Mejorar',
  'Include one result with a number.': 'Incluye un resultado con una cifra.',
  'Include the skills that matter for your next role.':
    'Incluye las habilidades que importan para tu próximo puesto.',
  'Includes every language version and the design settings. Keep it for yourself and reopen it here to continue editing.':
    'Incluye todas las versiones de idioma y el diseño. Guárdala para ti y ábrela aquí para seguir editando.',
  'Insert this structure': 'Insertar esta estructura',
  Institution: 'Centro de estudios',
  'Interface language': 'Idioma de la interfaz',
  'Job posting text': 'Texto de la oferta',
  'Job title': 'Puesto',
  'Job title or speciality': 'Puesto o especialidad',
  'Keep an editable PDF copy for future changes':
    'Guarda una copia PDF editable para futuros cambios',
  'Keep the example': 'Mantener el ejemplo',
  'Keep your profile to 2–4 focused sentences.':
    'Deja tu perfil en 2–4 frases concretas.',
  'Keyboard shortcuts.': 'Atajos de teclado.',
  Keywords: 'Palabras clave',
  'LESS FORMATTING. MORE YOU.': 'MENOS FORMATO. MÁS TÚ.',
  'LET’S START WITH YOUR STORY': 'EMPECEMOS POR TU HISTORIA',
  Language: 'Idioma',
  'Last step: check the content, compare with a vacancy, and download your PDF.':
    'Último paso: revisa el contenido, compáralo con una oferta y descarga tu PDF.',
  Lead: 'Liderar',
  'Leave optional fields blank — they won’t appear in your PDF.':
    'Deja en blanco los campos opcionales: no aparecerán en tu PDF.',
  'Let your experience speak': 'Deja que tu experiencia hable',
  'LinkedIn, a portfolio, or GitHub — clickable, with the full address.':
    'LinkedIn, portfolio o GitHub: con enlace y la dirección completa.',
  'List 8–25 concrete skills: tools, languages, methods. Skip “communication”.':
    'Enumera 8–25 habilidades concretas: herramientas, lenguajes, métodos. Sin «comunicación».',
  'List the languages you speak and your proficiency.':
    'Indica los idiomas que hablas y tu nivel.',
  'Look around, then start your own resume whenever you are ready.':
    'Échale un vistazo y empieza tu propio currículum cuando quieras.',
  'Looking good · {count}': 'Bien resuelto · {count}',
  'Main navigation': 'Navegación principal',
  'Make it yours': 'Hazlo tuyo',
  'Margin headings and generous whitespace':
    'Títulos en el margen y mucho aire',
  'Match a job posting': 'Comparar con una oferta',
  'Measurable results': 'Resultados medibles',
  'Missing from your resume': 'Falta en tu currículum',
  Mixed: 'Mixta',
  'Modern template': 'Plantilla Modern',
  'More room for your experience': 'Más espacio para tu experiencia',
  'More than two pages. Try the compact template or shorten older experience.':
    'Más de dos páginas. Prueba la plantilla compacta o acorta la experiencia antigua.',
  'Most recent job first': 'Primero el empleo más reciente',
  'Most recent job first. 3–6 points for recent roles, 2–3 for older ones.':
    'Primero el empleo más reciente. 3–6 puntos para los puestos recientes, 2–3 para los antiguos.',
  'Move down': 'Bajar',
  'Move entry down': 'Bajar la entrada',
  'Move entry up': 'Subir la entrada',
  'Move up': 'Subir',
  'My resume': 'Mi currículum',
  'Name and contact': 'Nombre y contacto',
  Navy: 'Azul marino',
  Next: 'Siguiente',
  'Next page': 'Página siguiente',
  'No clichés': 'Sin tópicos',
  'No known skills found — check the frequent terms below.':
    'No se encontraron habilidades conocidas: revisa los términos frecuentes de abajo.',
  'No placeholders left': 'Sin marcadores pendientes',
  'No sign-up': 'Sin registro',
  'No sign-up. Your resume is never sent to a server.':
    'Sin registro. Tu currículum nunca se envía a un servidor.',
  'No watermarks': 'Sin marcas de agua',
  'No “I” or “my”': 'Sin «yo» ni «mi»',
  'Not saved': 'Sin guardar',
  'Nothing but text and whitespace': 'Solo texto y espacio',
  'Nothing here yet': 'Aún no hay nada',
  'Now: {count}. Concrete tools and methods, no generic traits.':
    'Ahora: {count}. Herramientas y métodos concretos, sin rasgos genéricos.',
  Olive: 'Oliva',
  'One achievement per line. Include measurable results.':
    'Un logro por línea. Incluye resultados medibles.',
  'One line on the problem, one on what you built, one on the result.':
    'Una línea sobre el problema, otra sobre lo que creaste y otra sobre el resultado.',
  'One point, one or two lines — under about 35 words.':
    'Un punto, una o dos líneas: menos de unas 35 palabras.',
  'Only the selected language, without an editable attachment. Ready for a job application.':
    'Solo el idioma elegido, sin adjunto editable. Lista para una candidatura.',
  'Open PDF / JSON': 'Abrir PDF / JSON',
  'Open a resume from PDF or JSON': 'Abrir un currículum desde PDF o JSON',
  'Open backup': 'Abrir copia de seguridad',
  'Open resume': 'Abrir currículum',
  'Open resume file': 'Abrir archivo de currículum',
  'Open this resume?': '¿Abrir este currículum?',
  'Opening file…': 'Abriendo el archivo…',
  'Opening replaces your current resume. Save a backup to return to it later. You can also undo right after opening.':
    'Abrirlo sustituye tu currículum actual. Guarda una copia para volver a él más tarde. También puedes deshacer justo después de abrirlo.',
  'Opening the editor…': 'Abriendo el editor…',
  'PDF downloaded for sharing. It contains only the selected language. Your resume remains in the editor.':
    'PDF para enviar descargado. Contiene solo el idioma elegido. Tu currículum sigue en el editor.',
  'PDF pages': 'Páginas del PDF',
  'PDF preview could not load. Retry or switch to text.':
    'No se pudo cargar la vista previa del PDF. Reinténtalo o cambia al texto.',
  'PDF properties': 'Propiedades del PDF',
  Page: 'Página',
  'Pages: {pages} · A4': 'Páginas: {pages} · A4',
  Panels: 'Paneles',
  'Paste a job posting to see which of its skills and terms your resume already covers. Everything runs in your browser.':
    'Pega una oferta para ver qué habilidades y términos ya cubre tu currículum. Todo se procesa en tu navegador.',
  'Paste the job description…': 'Pega la descripción del puesto…',
  Phone: 'Teléfono',
  'Photo (optional)': 'Foto (opcional)',
  'Pick 2–4 projects that match the role. Link to the live version or code.':
    'Elige 2–4 proyectos acordes al puesto. Enlaza la versión publicada o el código.',
  Plum: 'Ciruela',
  'Points for your latest role': 'Puntos del puesto más reciente',
  'Points start with actions, not duties.':
    'Los puntos empiezan con acciones, no con tareas.',
  'Preparing PDF…': 'Preparando el PDF…',
  'Preparing preview…': 'Preparando la vista previa…',
  'Preparing…': 'Preparando…',
  Present: 'Actualidad',
  Preview: 'Vista previa',
  'Preview mode': 'Modo de vista previa',
  'Preview zoom': 'Zoom de la vista previa',
  'Previous page': 'Página anterior',
  Proficiency: 'Nivel',
  'Profile links': 'Enlaces de perfil',
  'Profile: 2–4 sentences': 'Perfil: 2–4 frases',
  'Project link': 'Enlace del proyecto',
  'Project name': 'Nombre del proyecto',
  'Prove your top skills with a point in your experience — that is what readers trust.':
    'Demuestra tus habilidades clave con un punto de tu experiencia: es lo que más convence.',
  Purple: 'Morado',
  'Qualities are shown with facts.': 'Las cualidades se muestran con hechos.',
  'Ready for what’s next': 'Lista para lo que venga',
  'Ready to send?': '¿Listo para enviarlo?',
  'Redesigned the checkout flow, raising conversion by 18% in three months.':
    'Rediseñé el proceso de pago y aumenté la conversión un 18 % en tres meses.',
  Redo: 'Rehacer',
  'Redo · Ctrl/⌘ Shift Z': 'Rehacer · Ctrl/⌘ Mayús Z',
  'Remove entry': 'Eliminar entrada',
  'Remove photo': 'Quitar foto',
  'Reorder sections or hide the ones you don’t need. Hidden content is kept.':
    'Reordena las secciones u oculta las que no necesites. El contenido oculto se conserva.',
  Replace: 'Cambiar',
  'Replace text in [square brackets] with your own details.':
    'Sustituye el texto entre [corchetes] por tus datos.',
  'Replace “responsible for” and “helped” with what you actually did.':
    'Sustituye «responsable de» y «ayudé» por lo que hiciste de verdad.',
  Research: 'Analizar',
  'Reset to the template’s order': 'Restablecer el orden de la plantilla',
  'Responsible for the checkout page.': 'Responsable de la página de pago.',
  'Resume actions': 'Acciones del currículum',
  'Resume opened. Undo restores the previous document.':
    'Currículum abierto. Deshacer recupera el documento anterior.',
  'Resume preview': 'Vista previa del currículum',
  'Resume steps': 'Pasos del currículum',
  'Resume text': 'Texto del currículum',
  'Resume text copied — paste it into the application form.':
    'Texto del currículum copiado: pégalo en el formulario de la candidatura.',
  'Resume typography': 'Tipografía del currículum',
  'Resume, page {page}': 'Currículum, página {page}',
  'Resumes skip pronouns: “Launched…”, not “I launched…”.':
    'Los currículums no usan pronombres: «Lancé…», no «Yo lancé…».',
  'Retry loading': 'Reintentar la carga',
  'Retry preview': 'Reintentar la vista previa',
  'Retry saving': 'Reintentar el guardado',
  'Reverse chronological order is what readers expect.':
    'El orden cronológico inverso es lo que se espera.',
  Review: 'Revisión',
  'Review & finish': 'Revisar y terminar',
  'Rewrite “{text}” to start with an action.':
    'Reescribe «{text}» para que empiece con una acción.',
  'Role / organization': 'Rol / organización',
  'Room to strengthen': 'Margen de mejora',
  'SIMPLER THAN YOU THINK': 'MÁS SENCILLO DE LO QUE CREES',
  STEP: 'PASO',
  Sans: 'Sin serifa',
  Save: 'Guardar',
  'Save JSON backup': 'Guardar copia JSON',
  'Save backup': 'Guardar copia',
  'Saved in this browser': 'Guardado en este navegador',
  'Saving…': 'Guardando…',
  Sections: 'Secciones',
  Serif: 'Con serifa',
  'Show sections': 'Mostrar secciones',
  'Show work you’re proud of.': 'Muestra trabajos de los que estés orgulloso.',
  'Skills first · a clear single column':
    'Habilidades primero · una columna clara',
  'Skip to content': 'Ir al contenido',
  'Skip “I” and clichés like “team player” or “hard-working”.':
    'Sin «yo» ni tópicos como «trabajo en equipo» o «trabajador».',
  'Start a new point in “{entry}”:': 'Empieza un nuevo punto en «{entry}»:',
  'Start a new resume?': '¿Empezar un currículum nuevo?',
  'Start date': 'Fecha de inicio',
  'Start my own': 'Empezar el mío',
  'Start new': 'Empezar de nuevo',
  'Start with a blank page or explore the editor with a filled-in example.':
    'Empieza con una página en blanco o explora el editor con un ejemplo ya relleno.',
  'Start with an action: “Launched”, “Improved”, “Built” — then add the outcome.':
    'Empieza con una acción: «Lancé», «Mejoré», «Desarrollé», y añade el resultado.',
  'Start with an example': 'Empezar con un ejemplo',
  'Start with the essentials: who you are and what you do.':
    'Empieza por lo esencial: quién eres y a qué te dedicas.',
  'Start with your most recent role. Focus on what you achieved.':
    'Empieza por tu puesto más reciente. Céntrate en lo que lograste.',
  'Strong action verbs': 'Verbos de acción',
  Subject: 'Asunto',
  'Take the next step': 'Da el siguiente paso',
  'Target job title': 'Puesto objetivo',
  Teal: 'Turquesa',
  'Tell your story': 'Cuenta tu historia',
  Template: 'Plantilla',
  Templates: 'Plantillas',
  Terracotta: 'Terracota',
  Text: 'Texto',
  'Text density': 'Densidad del texto',
  'Text size': 'Tamaño del texto',
  'The file name and the properties that apps and screening systems read. Empty fields are filled from your resume.':
    'El nombre del archivo y las propiedades que leen las aplicaciones y los sistemas de selección. Los campos vacíos se rellenan con tu currículum.',
  'The first step is simple.': 'El primer paso es sencillo.',
  'The title under your name is the first thing matched to a vacancy.':
    'El título bajo tu nombre es lo primero que se compara con la oferta.',
  'The {language} version is empty': 'La versión «{language}» está vacía',
  'This browser could not save your data. Download a JSON backup before leaving.':
    'Este navegador no pudo guardar tus datos. Descarga una copia JSON antes de salir.',
  'This file exceeds 10 MB. Choose a smaller PDF or JSON file.':
    'Este archivo supera los 10 MB. Elige un PDF o JSON más pequeño.',
  'This is an example': 'Esto es un ejemplo',
  'This is before the start date.': 'Es anterior a la fecha de inicio.',
  'Use a phone number with at least six digits.':
    'Introduce un número de teléfono con al menos seis dígitos.',
  'This section has 100 entries. Edit or remove an entry before adding another.':
    'Esta sección tiene 100 entradas. Edita o elimina una antes de añadir otra.',
  'This will replace your current resume. Save a backup first if you want to return to it later.':
    'Esto sustituirá tu currículum actual. Guarda antes una copia si quieres volver a él.',
  'Three sentences: who you are, your strongest proof, what you want next.':
    'Tres frases: quién eres, tu mejor prueba y qué buscas.',
  'Timeless and professional': 'Atemporal y profesional',
  'To improve': 'Por mejorar',
  'Toggle color theme': 'Cambiar el tema de color',
  'Try an example': 'Ver un ejemplo',
  Undo: 'Deshacer',
  'Undo · Ctrl/⌘ Z': 'Deshacer · Ctrl/⌘ Z',
  'Untitled resume': 'Currículum sin título',
  'Updating preview…': 'Actualizando la vista previa…',
  'Use @ and a domain, like name@mail.com.':
    'Usa @ y un dominio, como nombre@mail.com.',
  'Use CEFR levels (A1–C2) or “Native”. Recruiters in Europe filter by them.':
    'Usa los niveles del MCER (A1–C2) o «Nativo». En Europa se filtra por ellos.',
  'Use Undo above to restore removed entries or changes.':
    'Usa Deshacer arriba para recuperar entradas eliminadas o cambios.',
  'Use a web address, like linkedin.com/in/name.':
    'Usa una dirección web, como linkedin.com/in/nombre.',
  'Use automatic values': 'Usar valores automáticos',
  'Use template': 'Usar plantilla',
  'Use the job title you are applying for, written the way vacancies write it.':
    'Escribe el puesto al que aspiras tal como aparece en las ofertas.',
  'Use the vacancy’s exact terms for skills you really have (React, not “React.js framework”).':
    'Usa los términos exactos de la oferta para las habilidades que realmente tienes (React, no «framework React.js»).',
  'Verb groups': 'Grupos de verbos',
  'Website or portfolio': 'Web o portfolio',
  'What do you do well, and what value do you bring?':
    '¿Qué haces bien y qué valor aportas?',
  'Which copy do you need?': '¿Qué copia necesitas?',
  'Without “.pdf” — it is added for you.': 'Sin «.pdf»: se añade solo.',
  'FREE RESUME BUILDER': 'CREADOR DE CURRÍCULUMS GRATIS',
  'Your data stays with you.': 'Tus datos se quedan contigo.',
  'Your experience.': 'Tu experiencia.',
  'Your experience. At your pace.': 'Tu experiencia. A tu ritmo.',
  'Your full name': 'Tu nombre completo',
  'Your local data has not been changed. Try loading it again or open your PDF / JSON backup.':
    'Tus datos locales no se han modificado. Vuelve a cargarlos o abre tu copia PDF / JSON.',
  'Your name': 'Tu nombre',
  'Your name plus an email or phone number.':
    'Tu nombre y un correo o teléfono.',
  'Your professional profile': 'Tu perfil profesional',
  'Your resume is stored only in this browser. Clearing browser data removes the local copy, so keep an editable PDF or JSON backup.':
    'Tu currículum se guarda solo en este navegador. Si borras los datos del navegador, se pierde la copia local: guarda una copia PDF editable o JSON.',
  'Your resume, no strings attached.': 'Tu currículum, sin letra pequeña.',
  'Your skills': 'Tus habilidades',
  'Your story stays yours': 'Tu historia sigue siendo tuya',
  'Your story. Your data. Your next chapter.':
    'Tu historia. Tus datos. Tu próximo capítulo.',
  'Your story. Your style.': 'Tu historia. Tu estilo.',
  'Zoom in': 'Acercar',
  'Zoom out': 'Alejar',
  '[Action verb] [what you did], [result with a number] by [how].':
    '[Verbo de acción] [qué hiciste], [resultado con una cifra] mediante [cómo].',
  '[Job title] with [N] years of experience in [field]. [Strongest result with a number]. Looking for [the role or team you want].':
    '[Puesto] con [N] años de experiencia en [área]. [Mejor resultado con una cifra]. Busca [el puesto o equipo que quieres].',
  'best.': 'mejor versión.',
  'e.g. Berlin, Germany': 'p. ej., Berlín, Alemania',
  'e.g. Product designer': 'p. ej., Diseñadora de producto',
  'great presentation.': 'una gran presentación.',
  'key skills from the posting appear in your resume.':
    'habilidades clave de la oferta aparecen en tu currículum.',
  'main column': 'columna principal',
  'move down': 'bajar',
  'move up': 'subir',
  'sections filled': 'secciones completadas',
  'show in PDF': 'mostrar en el PDF',
  'side column': 'columna lateral',
  'to a fresh start.': 'a un nuevo comienzo.',
  '{label}: an end date is before its start date. Check the dates.':
    '{label}: una fecha de fin es anterior a la de inicio. Revisa las fechas.',
  '{label}: fill in the empty entry or remove it.':
    '{label}: completa la entrada vacía o elimínala.',
  '{label}: split long paragraphs into shorter points.':
    '{label}: divide los párrafos largos en puntos más cortos.',
  '{measured} of {total} points include a number. Aim for at least half.':
    '{measured} de {total} puntos incluyen una cifra. Apunta a la mitad como mínimo.',
  '{passed} of {total} content checks passed. These help human readers and screening systems; they are not a universal ATS score.':
    '{passed} de {total} comprobaciones de contenido superadas. Ayudan a los lectores y a los sistemas de selección; no son una puntuación ATS universal.',
  '{title}: {position} of {total}': '{title}: {position} de {total}',
  '“{text}” proves nothing — show it with a fact instead.':
    '«{text}» no demuestra nada: muéstralo con un hecho.',
  ' — home': ' — inicio',
  'Made by': 'Hecho por',
  'Action verbs': 'Verbos de acción',
  'Add a certificate when you have one: IELTS, TOEFL, Goethe, TestDaF, DELE.':
    'Si tienes un certificado, indícalo: IELTS, TOEFL, Goethe, TestDaF, DELE.',
  'Added skills': 'Habilidades añadidas',
  'All suggestions added.': 'Has añadido todas las sugerencias.',
  'Another skill…': 'Otra habilidad…',
  'BSc Computer Science · TU Berlin · 2016–2020 · Thesis on real-time collaborative editing':
    'Grado en Informática · Universidad Politécnica de Madrid · 2016–2020 · TFG sobre edición colaborativa en tiempo real',
  'Choose a language': 'Elige un idioma',
  'Choose how your resume looks. You can switch at any time — your text stays.':
    'Elige el aspecto de tu CV. Puedes cambiarlo en cualquier momento: tu texto se mantiene.',
  'Color and type': 'Color y tipografía',
  'Communication, teamwork, MS Office, hard-working':
    'Comunicación, trabajo en equipo, MS Office, trabajador',
  'Computer science graduate who built three web apps used by 2,000 students. Looking for a junior frontend role in a product team.':
    'Graduado en Informática que creó tres aplicaciones web usadas por 2000 estudiantes. Busco un puesto junior de frontend en un equipo de producto.',
  Data: 'Datos',
  Development: 'Desarrollo',
  'English — C1 (IELTS 7.5)': 'Inglés — C1 (IELTS 7,5)',
  'English — good': 'Inglés — bueno',
  'Enter or a comma adds a skill. Use the vacancy’s wording, and only skills you really have.':
    'Enter o una coma añaden una habilidad. Usa los términos de la oferta y solo las habilidades que de verdad tienes.',
  'Example text — your own text will replace it':
    'Texto de ejemplo: tu texto lo sustituirá',
  Examples: 'Ejemplos',
  Field: 'Área',
  Finance: 'Finanzas',
  HR: 'RR. HH.',
  'Helped with recruiting.': 'Ayudé con la selección de personal.',
  'Hide from resume': 'Ocultar del CV',
  'Hired 14 engineers in six months and cut time to hire from 52 to 31 days.':
    'Contraté a 14 ingenieros en seis meses y reduje el tiempo de contratación de 52 a 31 días.',
  'How to write: {section}': 'Cómo escribir: {section}',
  'In resume': 'En el CV',
  'Language name': 'Nombre del idioma',
  'Level in your own words': 'Nivel con tus palabras',
  'Managed 25 key accounts worth €1.2M a year and kept 96% of them at renewal.':
    'Gestioné 25 cuentas clave por valor de 1,2 M€ al año y renovaron el 96 %.',
  Marketing: 'Marketing',
  'Meal planner (React, Supabase): 1,200 monthly users plan a week of meals in three clicks instead of twelve. Live demo and code linked.':
    'Planificador de menús (React, Supabase): 1200 usuarios al mes planifican la semana en tres clics en lugar de doce. Demo y código enlazados.',
  Office: 'Oficina',
  'Often listed in {field}:': 'Habituales en {field}:',
  Operations: 'Operaciones',
  'Other…': 'Otro…',
  'PDF file properties': 'Propiedades del archivo PDF',
  'PDF pages — drag or scroll to explore': 'Páginas PDF: arrastra o desplázate',
  'Personal website.': 'Web personal.',
  Product: 'Producto',
  'React, TypeScript, Node.js, PostgreSQL, Figma, Accessibility (WCAG 2.2), Jest, CI/CD':
    'React, TypeScript, Node.js, PostgreSQL, Figma, accesibilidad (WCAG 2.2), Jest, CI/CD',
  'Recent graduate looking for any job in IT.':
    'Recién graduado, busco cualquier trabajo en IT.',
  'Remove “{skill}”': 'Quitar «{skill}»',
  Sales: 'Ventas',
  'Section order and visibility': 'Orden y visibilidad de las secciones',
  'Senior Frontend Developer (React, TypeScript)':
    'Desarrollador frontend sénior (React, TypeScript)',
  'Show in resume': 'Mostrar en el CV',
  'Show it': 'Mostrar',
  Specialist: 'Especialista',
  'Steps done; hidden sections are not counted':
    'Pasos completados; las secciones ocultas no cuentan',
  Structure: 'Estructura',
  'Suggested skills': 'Habilidades sugeridas',
  'Suggestions by field:': 'Sugerencias por área:',
  Support: 'Soporte',
  'This section is hidden and won’t appear in your PDF. What you entered is kept.':
    'Esta sección está oculta y no aparecerá en el PDF. Lo que escribiste se conserva.',
  'University, 2016–2020': 'Universidad, 2016–2020',
  'Worked with clients.': 'Trabajé con clientes.',
  'You can add a certificate: “C1 (IELTS 7.5)”.':
    'Puedes añadir un certificado: «C1 (IELTS 7,5)».',
  'e.g. Figma, then Enter': 'p. ej., Figma y Enter',
  'ivan.petrov.1990@mail.com · Berlin, Hauptstraße 5, flat 12':
    'ivan.petrov.1990@mail.com · Madrid, calle Mayor 5, 3.º B',
  'ivan.petrov@mail.com · Berlin, Germany · linkedin.com/in/ivanpetrov':
    'ivan.petrov@mail.com · Madrid, España · linkedin.com/in/ivanpetrov',
  '{section} in resume': '{section} en el CV',
  'Something went wrong': 'Algo salió mal',
  'Your resume is saved in this browser and nothing is lost. Reload the page — or download a copy first.':
    'Tu CV está guardado en este navegador y no se ha perdido nada. Recarga la página o descarga antes una copia.',
  Reload: 'Recargar',
  'Download a copy (JSON)': 'Descargar una copia (JSON)',
  'Report the problem': 'Informar del problema',
  'Report a problem': 'Informar de un problema',
  'JSON backup downloaded. Open it here to restore your resume.':
    'Copia JSON descargada. Ábrela aquí para restaurar tu currículum.',
  'Could not download the backup. Try again; your resume is still here.':
    'No se pudo descargar la copia. Inténtalo de nuevo; tu currículum sigue aquí.',
  'MADE BY A PERSON': 'UN PROYECTO PERSONAL',
  'The developer behind NeatCV.': 'El desarrollador de NeatCV.',
  'A good resume shouldn’t end at a checkout.':
    'Un buen currículum no debería terminar en una pantalla de pago.',
  'I built NeatCV so you can focus on your experience, make a clear resume and download it without a last-minute payment screen.':
    'Creé NeatCV para que puedas centrarte en tu experiencia, preparar un currículum claro y descargarlo sin encontrarte con un pago al final.',
  'This is my personal project. There is no paid tier: every template, editing feature and PDF download is free, without watermarks or an account. Your resume stays in your browser.':
    'Es mi proyecto personal. No hay plan de pago: todas las plantillas, las funciones de edición y las descargas PDF son gratuitas, sin marcas de agua ni cuenta. Tu currículum permanece en tu navegador.',
  'See the source on GitHub': 'Ver el código en GitHub',
  'Sentry integration is prepared and stays disabled without a valid DSN. When configured, error reports contain only an error category, a safe page route, loaded application asset names, line and column positions, and generated report identifiers and timestamps. Resume text, arbitrary error messages, names, contacts, photos, file names, URL queries, browser breadcrumbs and attachments are excluded. There is no session replay or automatic performance recording. Do Not Track and Global Privacy Control prevent reporting.':
    'La integración de Sentry está preparada y permanece desactivada sin un DSN válido. Una vez configurada, los informes solo contienen la categoría del error, una ruta segura, nombres de archivos cargados de la aplicación, posiciones de línea y columna e identificadores y marcas de tiempo generados. Se excluyen el texto del currículum, mensajes de error arbitrarios, nombres, contactos, fotos, nombres de archivos personales, parámetros URL, historial de acciones y adjuntos. No hay grabación de sesiones ni registro automático del rendimiento. Do Not Track y Global Privacy Control impiden los informes.',
  'The configured reporting host receives connection data, including IP address and browser request headers. Region and retention depend on that Sentry project; these settings must be reviewed before activation. No resume content is included.':
    'El servidor configurado recibe datos de conexión, incluida la dirección IP y las cabeceras del navegador. La región y la retención dependen del proyecto de Sentry y deben revisarse antes de activarlo. No se incluye el contenido del currículum.',
  'Reporting host: {host}': 'Servidor de informes: {host}',
}
export default messages
