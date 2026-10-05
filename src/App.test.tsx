import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { loadLocale } from './i18n'
import { exportPdf } from './pdf'
import { keepStorage, loadDocument, saveDocument } from './storage'
import { createDocument, emptyEntry } from './model'
vi.mock('./pdf', () => ({
  exportPdf: vi.fn(async () => new Blob(['PDF'], { type: 'application/pdf' })),
}))
vi.mock('./Preview', () => ({ default: () => <div>PDF preview</div> }))
vi.mock('./storage', () => ({
  loadDocument: vi.fn(async () => null),
  saveDocument: vi.fn(async () => undefined),
  keepStorage: vi.fn(async () => undefined),
}))
beforeAll(async () => {
  // Allow the first lazy editor import to finish on a busy machine.
  configure({ asyncUtilTimeout: 3000 })
  await Promise.all((['de', 'es', 'bg', 'uk'] as const).map(loadLocale))
  URL.createObjectURL = vi.fn(() => 'blob:test')
  URL.revokeObjectURL = vi.fn()
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.setItem('neatcv-locale', 'ru')
})
afterEach(cleanup)

/** New documents open on the Template step; most tests continue in Personal details. */
async function openStep(name: RegExp | string) {
  const nav = await screen.findByRole('navigation', {
    name: /Шаги резюме|Resume steps|Schritte|Pasos|Стъпки|Кроки/,
  })
  // The first match is the step itself; a visibility toggle may follow it.
  fireEvent.click(within(nav).getAllByRole('button', { name })[0])
}
async function newResume() {
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  await openStep(/Личные данные/)
}
async function startExample() {
  fireEvent.click(
    await screen.findByRole('button', { name: /Начать с примера/ }),
  )
  await openStep(/Личные данные/)
}
it('offers clear starting choices on the editor route', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('heading', { name: 'Первый шаг — простой.' }),
  ).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Новое резюме/ }))
  // A new resume starts with choosing a template.
  expect(
    await screen.findByRole('heading', { name: 'Шаблон' }),
  ).toBeInTheDocument()
  await openStep(/Личные данные/)
  expect(await screen.findByLabelText('Имя и фамилия')).toHaveValue('')
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Тестовый Пользователь' },
  })
  await waitFor(() =>
    expect(screen.getByText('Тестовый Пользователь')).toBeInTheDocument(),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('')
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue(
    'Тестовый Пользователь',
  )
})
it('preserves shared contacts while keeping translated names separate', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await startExample()
  fireEvent.change(screen.getByLabelText('Электронная почта'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.change(screen.getByLabelText('GitHub'), {
    target: { value: 'https://github.com/example' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык интерфейса' }), {
    target: { value: 'de' },
  })
  // The site and the resume switch together to the German version.
  expect(screen.getByLabelText('E-Mail')).toHaveValue('test@example.com')
  expect(screen.getByLabelText('GitHub')).toHaveValue(
    'https://github.com/example',
  )
  expect(screen.getByLabelText('Vollständiger Name')).toHaveValue('Alex Morgan')
  expect(screen.getByLabelText('Position oder Fachgebiet')).toHaveValue(
    'Produktdesignerin',
  )
  fireEvent.change(screen.getByLabelText('Vollständiger Name'), {
    target: { value: 'Alex M.' },
  })
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Sprache der Oberfläche' }),
    { target: { value: 'ru' } },
  )
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue(
    'Александра Морозова',
  )
})
it('adds, edits, deletes, and restores an experience entry', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  // The section opens with one empty entry, ready to fill.
  await openStep(/Опыт работы/)
  fireEvent.change(screen.getByLabelText('Должность'), {
    target: { value: 'Designer' },
  })
  fireEvent.change(screen.getByLabelText('Начало'), {
    target: { value: '2024-01' },
  })
  fireEvent.click(screen.getByLabelText('По настоящее время'))
  expect(screen.queryByLabelText('Окончание')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Удалить запись' }))
  expect(screen.queryByLabelText('Должность')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Должность')).toHaveValue('Designer')
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык интерфейса' }), {
    target: { value: 'en' },
  })
  expect(screen.getByLabelText('Job title')).toHaveValue('')
  expect(screen.getByLabelText('Start date')).toHaveValue('2024-01')
  expect(screen.getByLabelText('Present')).toBeChecked()
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Interface language' }),
    { target: { value: 'uk' } },
  )
  expect(screen.getByLabelText('Посада')).toHaveValue('')
  expect(screen.getByLabelText('Початок')).toHaveValue('2024-01')
})
it('announces selected design controls and restores typography with undo', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  await openStep(/Шаблон/)
  expect(
    within(
      screen.getByRole('navigation', { name: 'Шаги резюме' }),
    ).getAllByRole('button', { name: /Шаблон/ })[0],
  ).toHaveAttribute('aria-pressed', 'true')
  const typography = screen.getByRole('group', { name: 'Шрифт резюме' })
  fireEvent.click(
    within(typography).getByRole('button', { name: 'С засечками' }),
  )
  expect(
    within(typography).getByRole('button', { name: 'С засечками' }),
  ).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(
    within(typography).getByRole('button', { name: 'Без засечек' }),
  ).toHaveAttribute('aria-pressed', 'true')
  const density = screen.getByRole('group', { name: 'Плотность текста' })
  fireEvent.click(within(density).getByRole('button', { name: 'Компактнее' }))
  expect(
    within(density).getByRole('button', { name: 'Компактнее' }),
  ).toHaveAttribute('aria-pressed', 'true')
})

it('keeps fast edits in separate fields as separate undo steps and supports shortcuts', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Jane' },
  })
  fireEvent.change(screen.getByLabelText('Телефон'), {
    target: { value: '+420 123' },
  })
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(screen.getByLabelText('Телефон')).toHaveValue('')
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Jane')
  fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true })
  expect(screen.getByLabelText('Телефон')).toHaveValue('+420 123')
})
it('previews an import, allows cancel, then restores the previous document with undo', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Original' },
  })
  const file = {
    name: 'test.json',
    size: 100,
    text: async () => JSON.stringify({ basics: { name: 'Imported' } }),
  }
  const upload = () =>
    fireEvent.change(screen.getByLabelText('Открыть файл резюме'), {
      target: { files: [file] },
    })
  upload()
  await screen.findByRole('dialog')
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Original')
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Original')
  fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  upload()
  fireEvent.click(await screen.findByRole('button', { name: 'Открыть резюме' }))
  expect(await screen.findByLabelText('Имя и фамилия')).toHaveValue('Imported')
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Original')
})
it('keeps the latest edits made while an import is being read', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  let finish!: (value: string) => void
  const file = {
    name: 'test.json',
    size: 100,
    text: () =>
      new Promise<string>((resolve) => {
        finish = resolve
      }),
  }
  fireEvent.change(screen.getByLabelText('Открыть файл резюме'), {
    target: { files: [file] },
  })
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Latest edit' },
  })
  finish(JSON.stringify({ basics: { name: 'Imported' } }))
  fireEvent.click(await screen.findByRole('button', { name: 'Открыть резюме' }))
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Latest edit')
})
it('rejects oversized imports without changing the current resume', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const read = vi.fn()
  fireEvent.change(screen.getByLabelText('Открыть файл резюме'), {
    target: { files: [{ name: 'large.json', size: 10_000_001, text: read }] },
  })
  expect(await screen.findByText(/Файл больше 10 МБ/)).toBeInTheDocument()
  expect(read).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
it('keeps forms free of inline guidance and retains optional writing help and review', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  expect(screen.queryByText('Небольшая подсказка')).not.toBeInTheDocument()
  await openStep(/Образование/)
  fireEvent.click(screen.getByRole('button', { name: 'Добавить запись' }))
  expect(screen.getAllByLabelText('Учебное заведение').at(-1)).toHaveValue('')
  expect(screen.queryByText('Небольшая подсказка')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /Скрыть подсказку/ }),
  ).not.toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: 'Как заполнить этот раздел' }),
  )
  expect(
    await screen.findByRole('dialog', { name: 'Как заполнить: Образование' }),
  ).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
  await openStep(/Проверка/)
  expect(
    await screen.findByRole('heading', { name: 'Проверка и отправка' }),
  ).toBeVisible()
  expect(screen.getByText(/проверок содержания/)).toBeVisible()
})
it('closes document actions with Escape and returns focus to its trigger', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const trigger = screen.getByRole('button', { name: 'Действия с резюме' })
  fireEvent.click(trigger)
  expect(
    screen.getByRole('button', { name: 'Сохранить JSON-копию' }),
  ).toHaveFocus()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(trigger).toHaveFocus()
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

it('protects unreadable saved data and retries loading without creating an empty replacement', async () => {
  vi.mocked(loadDocument).mockRejectedValueOnce(new Error('Read failed'))
  vi.mocked(loadDocument).mockResolvedValueOnce(createDocument(true, 'ru'))
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('heading', {
      name: 'Не удалось открыть сохранённое резюме',
    }),
  ).toBeInTheDocument()
  expect(saveDocument).not.toHaveBeenCalled()
  expect(
    screen.queryByRole('button', { name: /Новое резюме/ }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }))
  await openStep(/Личные данные/)
  expect(await screen.findByLabelText('Имя и фамилия')).toHaveValue(
    'Александра Морозова',
  )
})
it('retries a failed save without losing form content', async () => {
  vi.mocked(saveDocument).mockRejectedValueOnce(new Error('Write failed'))
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Unsaved name' },
  })
  fireEvent.click(
    await screen.findByRole('button', { name: 'Повторить сохранение' }),
  )
  await waitFor(() =>
    expect(screen.getByText('Сохранено в браузере')).toBeInTheDocument(),
  )
  expect(
    vi.mocked(saveDocument).mock.lastCall?.[0].versions.ru.basics.name,
  ).toBe('Unsaved name')
})

it('collapses entries without losing edits and keeps their state while reordering', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await startExample()
  await openStep(/Опыт работы/)
  fireEvent.change(screen.getAllByLabelText('Должность')[0], {
    target: { value: 'Senior designer' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Свернуть все' }))
  expect(screen.queryAllByRole('textbox', { name: 'Должность' })).toHaveLength(
    0,
  )
  const heading = screen.getByRole('heading', { name: /Senior designer/ })
  expect(within(heading).getByRole('button')).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  fireEvent.click(screen.getAllByRole('button', { name: 'Опустить' })[0])
  fireEvent.click(
    within(screen.getByRole('heading', { name: /Senior designer/ })).getByRole(
      'button',
    ),
  )
  expect(screen.getByRole('textbox', { name: 'Должность' })).toHaveValue(
    'Senior designer',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByRole('textbox', { name: 'Должность' })).toHaveValue(
    'Senior designer',
  )
  expect(screen.getAllByRole('button', { name: 'Поднять' })[0]).toBeDisabled()
})
it('focuses a new entry and keeps keyboard focus after deleting it', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  await openStep(/Опыт работы/)
  fireEvent.click(screen.getByRole('button', { name: 'Удалить запись' }))
  expect(screen.getByRole('button', { name: 'Добавить запись' })).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Добавить запись' }))
  expect(screen.getByLabelText('Должность')).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: 'Удалить запись' }))
  expect(screen.getByRole('button', { name: 'Добавить запись' })).toHaveFocus()
})

it('prevents adding entries beyond the supported persistence limit', async () => {
  const doc = createDocument(false, 'ru')
  doc.versions.ru.work = Array.from({ length: 100 }, (_, i) => ({
    ...emptyEntry(),
    title: `Role ${i + 1}`,
  }))
  vi.mocked(loadDocument).mockResolvedValueOnce(doc)
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await openStep(/Опыт работы/)
  expect(screen.getByRole('button', { name: 'Добавить запись' })).toBeDisabled()
  expect(screen.getByText(/В разделе уже 100 записей/)).toBeInTheDocument()
})

it('lets users choose a sharing PDF or editable backup with distinct filenames', async () => {
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  const filenames: string[] = []
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      filenames.push(this.download)
    })
  try {
    render(
      <MemoryRouter initialEntries={['/edit']}>
        <App />
      </MemoryRouter>,
    )
    await startExample()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    expect(screen.getByRole('radio', { name: /Для отправки/ })).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Назад к правкам' }))
    expect(exportPdf).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    await waitFor(() =>
      expect(exportPdf).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'ru' }),
        { editable: false },
      ),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(filenames[0]).toBe('Александра-Морозова-RU-CV.pdf')
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    fireEvent.click(screen.getByRole('radio', { name: /Редактируемая копия/ }))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    await waitFor(() =>
      expect(filenames[1]).toBe('Александра-Морозова-RU-editable-CV.pdf'),
    )
    expect(exportPdf).toHaveBeenLastCalledWith(expect.any(Object), {
      editable: true,
    })
  } finally {
    create.mockRestore()
    click.mockRestore()
  }
})
it('shows a failed export inside the dialog and retries without changing the choice', async () => {
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(exportPdf).mockRejectedValueOnce(new Error('Render failed'))
  try {
    render(
      <MemoryRouter initialEntries={['/edit']}>
        <App />
      </MemoryRouter>,
    )
    await startExample()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    fireEvent.click(screen.getByRole('radio', { name: /Редактируемая копия/ }))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    expect(
      await within(screen.getByRole('dialog')).findByRole('alert'),
    ).toHaveTextContent('Не удалось создать PDF')
    expect(
      screen.getByRole('radio', { name: /Редактируемая копия/ }),
    ).toBeChecked()
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(exportPdf).toHaveBeenCalledTimes(2)
  } finally {
    create.mockRestore()
    click.mockRestore()
    error.mockRestore()
  }
})

it('offers a backup after sharing and exports the latest edits from that action', async () => {
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  try {
    render(
      <MemoryRouter initialEntries={['/edit']}>
        <App />
      </MemoryRouter>,
    )
    await startExample()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const offer = screen.getByRole('button', {
      name: 'Редактируемая копия',
    })
    await openStep(/Личные данные/)
    fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
      target: { value: 'Latest edit' },
    })
    fireEvent.click(offer)
    expect(
      screen.getByRole('radio', { name: /Редактируемая копия/ }),
    ).toBeChecked()
    expect(
      screen.getByRole('button', { name: 'Сохранить JSON-копию' }),
    ).toBeEnabled()
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Скачать',
      }),
    )
    await waitFor(() =>
      expect(exportPdf).toHaveBeenLastCalledWith(
        expect.objectContaining({
          versions: expect.objectContaining({
            ru: expect.objectContaining({
              basics: expect.objectContaining({ name: 'Latest edit' }),
            }),
          }),
        }),
        { editable: true },
      ),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', {
        name: 'Редактируемая копия',
      }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Latest edit')
  } finally {
    click.mockRestore()
  }
})

it('keeps the backup dialog and data when a JSON download fails, then retries', async () => {
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {})
  try {
    render(
      <MemoryRouter initialEntries={['/edit']}>
        <App />
      </MemoryRouter>,
    )
    await startExample()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать PDF' }))
    fireEvent.click(screen.getByRole('radio', { name: /Редактируемая копия/ }))
    create.mockImplementationOnce(() => {
      throw new Error('Download unavailable')
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Сохранить JSON-копию' }),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Не удалось скачать копию/)).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Сохранить JSON-копию' }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/JSON-копия скачана/)).toBeInTheDocument()
    await openStep(/Личные данные/)
    expect(screen.getByLabelText('Имя и фамилия')).toHaveValue(
      'Александра Морозова',
    )
  } finally {
    create.mockRestore()
    click.mockRestore()
  }
})

it('opens in English for a new visitor and remembers a deliberate language choice', async () => {
  localStorage.removeItem('neatcv-locale')
  vi.mocked(loadDocument).mockResolvedValueOnce(null)
  const view = render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('button', { name: /Start with an example/ }),
  ).toBeVisible()
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Interface language' }),
    { target: { value: 'ru' } },
  )
  expect(localStorage.getItem('neatcv-locale')).toBe('ru')
  view.unmount()
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('heading', { name: 'Первый шаг — простой.' }),
  ).toBeVisible()
})
it('follows the device theme until the visitor picks one', async () => {
  localStorage.removeItem('neatcv-theme')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { name: 'Первый шаг — простой.' })
  expect(localStorage.getItem('neatcv-theme')).toBeNull()
  const before = document.documentElement.dataset.theme
  fireEvent.click(screen.getByRole('button', { name: 'Переключить тему' }))
  expect(document.documentElement.dataset.theme).not.toBe(before)
  expect(localStorage.getItem('neatcv-theme')).toBe(
    document.documentElement.dataset.theme,
  )
})
it('reviews content, adds a missing vacancy skill, and inserts an action verb', async () => {
  localStorage.removeItem('neatcv-job-posting')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await startExample()
  await openStep(/Опыт работы/)
  fireEvent.click(
    screen.getByRole('button', { name: 'Как заполнить этот раздел' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Улучшение' }))
  fireEvent.click(screen.getByRole('button', { name: 'Оптимизировал' }))
  expect(screen.getAllByLabelText('Результаты и достижения')[0]).toHaveFocus()
  expect(
    (
      screen.getAllByLabelText(
        'Результаты и достижения',
      )[0] as HTMLTextAreaElement
    ).value,
  ).toMatch(/\nОптимизировал $/)
  await openStep(/Проверка/)
  expect(
    await screen.findByRole('heading', { name: 'Проверка и отправка' }),
  ).toBeVisible()
  expect(screen.getByText(/проверок содержания/)).toBeVisible()
  fireEvent.change(screen.getByLabelText('Текст вакансии'), {
    target: {
      value:
        'Ищем дизайнера: Figma, дизайн-системы, Amplitude и A/B testing для продуктовых экспериментов.',
    },
  })
  const chip = screen.getByRole('button', { name: /Amplitude/ })
  fireEvent.click(chip)
  await openStep(/Навыки/)
  const added = screen.getByRole('list', { name: 'Добавленные навыки' })
  expect(within(added).getAllByRole('listitem').at(-1)).toHaveTextContent(
    'Amplitude',
  )
})
it('hides both panels with their own toolbar buttons and remembers them', async () => {
  localStorage.removeItem('neatcv-sidebar')
  localStorage.removeItem('neatcv-form-hidden')
  const view = render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const panels = screen.getByRole('group', { name: 'Панели' })
  const sections = within(panels).getByRole('button', { name: 'Разделы' })
  const formToggle = within(panels).getByRole('button', { name: 'Форма' })
  expect(sections).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(sections)
  expect(sections).toHaveAttribute('aria-pressed', 'false')
  expect(localStorage.getItem('neatcv-sidebar')).toBe('hidden')
  fireEvent.click(formToggle)
  expect(localStorage.getItem('neatcv-form-hidden')).toBe('hidden')
  view.unmount()
  vi.mocked(loadDocument).mockResolvedValueOnce(createDocument(false, 'ru'))
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  const again = within(await screen.findByRole('group', { name: 'Панели' }))
  expect(again.getByRole('button', { name: 'Разделы' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(again.getByRole('button', { name: 'Форма' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})
it('validates contact fields once they are left', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const email = screen.getByLabelText('Электронная почта')
  fireEvent.change(email, { target: { value: 'name.mail.com' } })
  expect(email).not.toHaveAttribute('aria-invalid')
  fireEvent.blur(email)
  expect(email).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('alert')).toHaveTextContent('Нужны @ и домен')
  fireEvent.change(email, { target: { value: 'name@mail.com' } })
  expect(email).not.toHaveAttribute('aria-invalid')
  const github = screen.getByLabelText('GitHub')
  fireEvent.change(github, { target: { value: 'ftp://example' } })
  fireEvent.blur(github)
  expect(github).toHaveAttribute('aria-invalid', 'true')
  fireEvent.change(github, { target: { value: 'github.com/example' } })
  expect(github).not.toHaveAttribute('aria-invalid')
  const phone = screen.getByLabelText('Телефон')
  fireEvent.change(phone, { target: { value: '(---)' } })
  fireEvent.blur(phone)
  expect(phone).toHaveAttribute('aria-invalid', 'true')
  fireEvent.change(phone, { target: { value: '+49 (30) 1234-5678' } })
  expect(phone).not.toHaveAttribute('aria-invalid')
})
it('moves through contacts with Enter without interrupting composition or multiline writing', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const name = screen.getByLabelText('Имя и фамилия')
  name.focus()
  fireEvent.keyDown(name, { key: 'Enter', isComposing: true })
  expect(name).toHaveFocus()
  fireEvent.keyDown(name, { key: 'Enter' })
  expect(screen.getByLabelText('Должность или специализация')).toHaveFocus()
  const github = screen.getByLabelText('GitHub')
  github.focus()
  fireEvent.keyDown(github, { key: 'Enter' })
  expect(github).not.toHaveFocus()
  await openStep(/О себе/)
  const profile = screen.getByLabelText('Коротко о вас')
  profile.focus()
  fireEvent.keyDown(profile, { key: 'Enter' })
  expect(profile).toHaveFocus()
})
it('toggles the form with one button, a shortcut, or by choosing a section', async () => {
  localStorage.removeItem('neatcv-form-hidden')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const toggle = screen.getByRole('button', { name: 'Форма' })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-pressed', 'false')
  fireEvent.keyDown(window, { key: '\\', ctrlKey: true })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await openStep(/Шаблон/)
  fireEvent.click(toggle)
  expect(localStorage.getItem('neatcv-form-hidden')).toBe('hidden')
  fireEvent.click(
    within(document.querySelector<HTMLElement>('.section-nav')!).getAllByRole(
      'button',
      { name: /Опыт работы/ },
    )[0],
  )
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(
    screen.getByRole('heading', { name: 'Опыт работы' }),
  ).toBeInTheDocument()
  // The divider adjusts the width from the keyboard and closes the form below its minimum.
  const divider = screen.getByRole('separator', { name: 'Ширина формы' })
  fireEvent.keyDown(divider, { key: 'Home' })
  expect(Number(localStorage.getItem('neatcv-form-width'))).toBe(340)
  fireEvent.keyDown(divider, { key: 'ArrowLeft' })
  expect(toggle).toHaveAttribute('aria-pressed', 'false')
  fireEvent.keyDown(divider, { key: 'Enter' })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
})
it('keeps writing guidance tucked away until it is opened', async () => {
  localStorage.removeItem('neatcv-guide')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const toggle = screen.getByRole('button', {
    name: 'Как заполнить этот раздел',
  })
  expect(toggle).toHaveAttribute('aria-haspopup', 'dialog')
  expect(screen.queryByText(/Укажите должность/)).not.toBeInTheDocument()
  fireEvent.click(toggle)
  const dialog = screen.getByRole('dialog', {
    name: 'Как заполнить: Личные данные',
  })
  expect(within(dialog).getByText(/Укажите должность/)).toBeVisible()
  // More than one before → after example.
  expect(within(dialog).getAllByText('Стало').length).toBeGreaterThan(1)
  fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  // The next section does not open it on its own.
  fireEvent.click(screen.getByRole('button', { name: /^Далее/ }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
it('offers to start an empty language version from a filled one', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Никита' },
  })
  fireEvent.change(screen.getByLabelText('Должность или специализация'), {
    target: { value: 'Фронтенд-разработчик' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык интерфейса' }), {
    target: { value: 'bg' },
  })
  expect(screen.getByText('Версията „Български“ е празна')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: /Копирай текста/ }))
  expect(screen.getByLabelText('Длъжност или специалност')).toHaveValue(
    'Фронтенд-разработчик',
  )
  fireEvent.change(screen.getByLabelText('Длъжност или специалност'), {
    target: { value: 'Frontend разработчик' },
  })
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Език на интерфейса' }),
    { target: { value: 'ru' } },
  )
  expect(screen.getByLabelText('Должность или специализация')).toHaveValue(
    'Фронтенд-разработчик',
  )
})
it('shows the interface and the resume in German together', async () => {
  localStorage.setItem('neatcv-locale', 'de')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Mit einem Beispiel beginnen/ }),
  )
  await openStep(/Persönliche Daten/)
  expect(screen.getByLabelText('Vollständiger Name')).toHaveValue('Alex Morgan')
  expect(screen.getByLabelText('Position oder Fachgebiet')).toHaveValue(
    'Produktdesignerin',
  )
  expect(screen.getByLabelText('Stadt und Land')).toHaveValue(
    'Berlin, Deutschland',
  )
})
it('opens the resume version that matches the site language', async () => {
  vi.mocked(loadDocument).mockResolvedValueOnce(createDocument(true, 'de'))
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  // Stored as German, shown in the site language (Russian here).
  await openStep(/Личные данные/)
  expect(await screen.findByLabelText('Имя и фамилия')).toHaveValue(
    'Александра Морозова',
  )
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык интерфейса' }), {
    target: { value: 'es' },
  })
  expect(screen.getByLabelText('Nombre completo')).toHaveValue('Alex Morgan')
  expect(screen.getByLabelText('Puesto o especialidad')).toHaveValue(
    'Diseñadora de producto',
  )
})
it('moves between steps with a fixed Back and Next footer', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  // The first step has no Back button: Next gets the whole footer.
  expect(
    screen.queryByRole('button', { name: /^Назад/ }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Далее: Личные данные' }))
  fireEvent.click(screen.getByRole('button', { name: 'Далее: О себе' }))
  expect(screen.getByRole('heading', { name: 'О себе' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Назад: Личные данные' }))
  expect(
    screen.getByRole('heading', { name: 'Личные данные' }),
  ).toBeInTheDocument()
})
it('deletes an entry from the button under its fields', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  await openStep(/Опыт работы/)
  fireEvent.change(screen.getByLabelText('Должность'), {
    target: { value: 'Temp' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Удалить эту запись' }))
  expect(screen.queryByLabelText('Должность')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Должность')).toHaveValue('Temp')
})
it('keeps animated deletions independent through simultaneous finishes, navigation and undo', async () => {
  const original = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'animate',
  )
  const closing: Animation[] = []
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: (frames: Keyframe[]) => {
      const animation = {
        cancel: vi.fn(),
        playState: 'running',
        onfinish: null,
      } as unknown as Animation
      if (frames.at(-1)?.height === '0px') closing.push(animation)
      return animation
    },
  })
  try {
    render(
      <MemoryRouter initialEntries={['/edit']}>
        <App />
      </MemoryRouter>,
    )
    await startExample()
    await openStep(/Опыт работы/)
    const cards = screen.getAllByRole('button', { name: 'Удалить запись' })
    fireEvent.click(cards[0])
    fireEvent.click(cards[1])
    expect(cards[0].closest('.entry-card')).toHaveAttribute('inert')
    expect(cards[1].closest('.entry-card')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(closing).toHaveLength(2)
    act(() => {
      for (const animation of closing)
        animation.onfinish?.call(
          animation,
          new Event('finish') as AnimationPlaybackEvent,
        )
    })
    expect(
      screen.queryByRole('button', { name: 'Удалить запись' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
    expect(
      screen.getAllByRole('button', { name: 'Удалить запись' }),
    ).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
    expect(
      screen.getAllByRole('button', { name: 'Удалить запись' }),
    ).toHaveLength(2)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Удалить запись' })[0],
    )
    await openStep(/Навыки/)
    await openStep(/Опыт работы/)
    expect(
      screen.getAllByRole('button', { name: 'Удалить запись' }),
    ).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
    expect(
      screen.getAllByRole('button', { name: 'Удалить запись' }),
    ).toHaveLength(2)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Удалить запись' })[0],
    )
    fireEvent.click(screen.getByRole('button', { name: 'Очистить всё' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Начать новое' }))
    await openStep(/Личные данные/)
    expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('')
  } finally {
    cleanup()
    if (original)
      Object.defineProperty(HTMLElement.prototype, 'animate', original)
    else delete (HTMLElement.prototype as Partial<HTMLElement>).animate
  }
})
it('edits PDF properties in Review and falls back to the resume', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await startExample()
  await openStep(/Проверка/)
  fireEvent.click(screen.getByRole('button', { name: 'Свойства файла PDF' }))
  const author = screen.getByLabelText('Автор')
  expect(author).toHaveAttribute('placeholder', 'Александра Морозова')
  fireEvent.change(author, { target: { value: 'A. Morozova' } })
  fireEvent.click(
    screen.getByRole('button', { name: 'Вернуть автоматические значения' }),
  )
  expect(screen.getByLabelText('Автор')).toHaveValue('')
})
it('leaves the example for an own resume from the banner or the sidebar', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Начать с примера/ }),
  )
  expect(screen.getByText('Это пример')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Начать своё' }))
  expect(screen.queryByText('Это пример')).not.toBeInTheDocument()
  await openStep(/Личные данные/)
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('')
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Мой' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Очистить всё' }))
  // Clearing real work asks first.
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
})
it('turns skills into chips, adds suggestions by field and removes a chip', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  fireEvent.change(screen.getByLabelText('Должность или специализация'), {
    target: { value: 'Фронтенд-разработчик' },
  })
  await openStep(/Навыки/)
  const input = screen.getByLabelText('Ваши навыки')
  fireEvent.change(input, { target: { value: 'React, TypeScript,' } })
  fireEvent.change(input, { target: { value: 'Vue' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  const added = () =>
    within(screen.getByRole('list', { name: 'Добавленные навыки' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent)
  expect(added()).toEqual(['React', 'TypeScript', 'Vue'])
  // The job title picks the field; suggestions skip what is already there.
  const field = screen.getByRole('group', { name: 'Сфера' })
  expect(
    within(field).getByRole('button', { name: 'Разработка' }),
  ).toHaveAttribute('aria-pressed', 'true')
  const suggested = screen.getByRole('group', { name: 'Предложенные навыки' })
  expect(
    within(suggested).queryByRole('button', { name: 'React' }),
  ).not.toBeInTheDocument()
  fireEvent.click(within(suggested).getByRole('button', { name: 'Docker' }))
  expect(added()).toEqual(['React', 'TypeScript', 'Vue', 'Docker'])
  fireEvent.click(screen.getByRole('button', { name: 'Убрать «TypeScript»' }))
  expect(added()).toEqual(['React', 'Vue', 'Docker'])
})
it('picks a language from the list and a CEFR level for every version', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  await openStep(/Языки/)
  fireEvent.change(screen.getByLabelText('Язык'), { target: { value: 'de' } })
  fireEvent.click(screen.getByRole('button', { name: 'C1' }))
  expect(screen.getByLabelText('Уровень своими словами')).toHaveValue(
    'C1 — продвинутый',
  )
  expect(screen.getByRole('button', { name: 'C1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  // The English version gets the same language and level in English.
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык интерфейса' }), {
    target: { value: 'en' },
  })
  expect(screen.getByLabelText('Language')).toHaveDisplayValue('German')
  expect(screen.getByLabelText('Level in your own words')).toHaveValue(
    'C1 — advanced',
  )
})
it('hides a section from the resume and skips it with Next', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  const nav = screen.getByRole('navigation', { name: 'Шаги резюме' })
  expect(within(nav).getByRole('button', { name: /Шаблон/ })).toBeVisible()
  // Leaving the template step confirms the template.
  expect(screen.getByText('1 / 9')).toBeInTheDocument()
  fireEvent.click(
    within(nav).getByRole('button', { name: '«Образование» в резюме' }),
  )
  expect(screen.getByText('1 / 8')).toBeInTheDocument()
  await openStep(/Опыт работы/)
  fireEvent.click(screen.getByRole('button', { name: /^Далее/ }))
  expect(screen.getByRole('heading', { name: 'Навыки' })).toBeInTheDocument()
  await openStep(/Образование/)
  expect(screen.getByText(/Раздел скрыт и не попадёт в PDF/)).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
  expect(screen.queryByText(/Раздел скрыт/)).not.toBeInTheDocument()
  expect(screen.getByLabelText('Специальность / степень')).toBeEnabled()
})

it('asks the browser to keep the resume only after real content is saved', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await newResume()
  await new Promise((resolve) => setTimeout(resolve, 400))
  expect(keepStorage).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Мария' },
  })
  await waitFor(() => expect(keepStorage).toHaveBeenCalled())
})
