import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { exportPdf } from './pdf'
import { loadDocument, saveDocument } from './storage'
import { createDocument, emptyEntry } from './model'
vi.mock('./pdf', () => ({
  exportPdf: vi.fn(async () => new Blob(['PDF'], { type: 'application/pdf' })),
}))
vi.mock('./Preview', () => ({ default: () => <div>PDF preview</div> }))
vi.mock('./storage', () => ({
  loadDocument: vi.fn(async () => null),
  saveDocument: vi.fn(async () => undefined),
}))
beforeAll(() => {
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
  localStorage.setItem('cv-locale', 'ru')
})
afterEach(cleanup)
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
  fireEvent.click(
    await screen.findByRole('button', { name: /Начать с примера/ }),
  )
  fireEvent.change(screen.getByLabelText('Электронная почта'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.change(screen.getByLabelText('GitHub'), {
    target: { value: 'https://github.com/example' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык резюме' }), {
    target: { value: 'de' },
  })
  // The interface stays Russian; the form now edits the German version.
  expect(screen.getByLabelText('Электронная почта')).toHaveValue(
    'test@example.com',
  )
  expect(screen.getByLabelText('GitHub')).toHaveValue(
    'https://github.com/example',
  )
  expect(screen.getByLabelText('Имя и фамилия')).toHaveValue('Alex Morgan')
  expect(screen.getByLabelText('Должность или специализация')).toHaveValue(
    'Produktdesignerin',
  )
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Alex M.' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык резюме' }), {
    target: { value: 'ru' },
  })
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.click(screen.getByRole('button', { name: /Опыт работы/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Добавить запись' }))
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
  for (const version of ['en', 'uk']) {
    fireEvent.change(screen.getByRole('combobox', { name: 'Язык резюме' }), {
      target: { value: version },
    })
    expect(screen.getByLabelText('Должность')).toHaveValue('')
    expect(screen.getByLabelText('Начало')).toHaveValue('2024-01')
    expect(screen.getByLabelText('По настоящее время')).toBeChecked()
  }
})
it('announces selected design controls and restores typography with undo', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Дизайн' }))
  expect(screen.getByRole('button', { name: 'Дизайн' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  fireEvent.change(screen.getByLabelText('Шрифт резюме'), {
    target: { value: 'serif' },
  })
  expect(screen.getByLabelText('Шрифт резюме')).toHaveValue('serif')
  fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
  expect(screen.getByLabelText('Шрифт резюме')).toHaveValue('sans')
})

it('keeps fast edits in separate fields as separate undo steps and supports shortcuts', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  const read = vi.fn()
  fireEvent.change(screen.getByLabelText('Открыть файл резюме'), {
    target: { files: [{ name: 'large.json', size: 10_000_001, text: read }] },
  })
  expect(await screen.findByText(/Файл больше 10 МБ/)).toBeInTheDocument()
  expect(read).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
it('opens the relevant section from a tip and restores dismissed guidance', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.click(screen.getByRole('button', { name: /Навыки/ }))
  // Tips belong to their section; Skills shows none about the name.
  expect(
    screen.queryByRole('button', {
      name: 'Добавьте имя, чтобы резюме было легко найти.',
    }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Личные данные/ }))
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Добавьте имя, чтобы резюме было легко найти.',
    }),
  )
  expect(screen.getByRole('heading', { name: 'Личные данные' })).toHaveFocus()
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Скрыть подсказку: Добавьте имя, чтобы резюме было легко найти.',
    }),
  )
  expect(
    screen.queryByRole('button', {
      name: 'Добавьте имя, чтобы резюме было легко найти.',
    }),
  ).not.toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: 'Показать скрытые подсказки' }),
  )
  expect(
    screen.getByRole('button', {
      name: 'Добавьте имя, чтобы резюме было легко найти.',
    }),
  ).toBeInTheDocument()
})
it('closes document actions with Escape and returns focus to its trigger', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
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
  fireEvent.click(
    await screen.findByRole('button', { name: /Начать с примера/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: /Опыт работы/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.click(screen.getByRole('button', { name: /Опыт работы/ }))
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
  fireEvent.click(await screen.findByRole('button', { name: /Опыт работы/ }))
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
    fireEvent.click(
      await screen.findByRole('button', { name: /Начать с примера/ }),
    )
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
    fireEvent.click(
      await screen.findByRole('button', { name: /Начать с примера/ }),
    )
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

it('opens in English for a new visitor and remembers a deliberate language choice', async () => {
  localStorage.removeItem('cv-locale')
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
  expect(localStorage.getItem('cv-locale')).toBe('ru')
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
  localStorage.removeItem('cv-theme')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('heading', { name: 'Первый шаг — простой.' })
  expect(localStorage.getItem('cv-theme')).toBeNull()
  const before = document.documentElement.dataset.theme
  fireEvent.click(screen.getByRole('button', { name: 'Переключить тему' }))
  expect(document.documentElement.dataset.theme).not.toBe(before)
  expect(localStorage.getItem('cv-theme')).toBe(
    document.documentElement.dataset.theme,
  )
})
it('reviews content, adds a missing vacancy skill, and inserts an action verb', async () => {
  localStorage.removeItem('cv-job-posting')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Начать с примера/ }),
  )
  fireEvent.click(screen.getByRole('button', { name: /Опыт работы/ }))
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
  fireEvent.click(screen.getByRole('button', { name: /Проверка/ }))
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
  fireEvent.click(screen.getByRole('button', { name: /Навыки/ }))
  expect(
    (screen.getByLabelText('Ваши навыки') as HTMLTextAreaElement).value,
  ).toMatch(/, Amplitude$/)
})
it('collapses the section panel and remembers the panel layout', async () => {
  localStorage.removeItem('cv-sidebar')
  localStorage.removeItem('cv-form-hidden')
  const view = render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.click(
    screen.getByRole('button', { name: 'Свернуть панель разделов' }),
  )
  expect(localStorage.getItem('cv-sidebar')).toBe('rail')
  expect(screen.getByRole('button', { name: 'Опыт работы' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Панель формы' }))
  expect(localStorage.getItem('cv-form-hidden')).toBe('hidden')
  view.unmount()
  vi.mocked(loadDocument).mockResolvedValueOnce(createDocument(false, 'ru'))
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  expect(
    await screen.findByRole('button', { name: 'Развернуть панель разделов' }),
  ).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByRole('button', { name: 'Панель формы' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
})
it('toggles the form with one button, a shortcut, or by choosing a section', async () => {
  localStorage.removeItem('cv-form-hidden')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  const toggle = screen.getByRole('button', { name: 'Панель формы' })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  fireEvent.keyDown(window, { key: '\\', ctrlKey: true })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(screen.getByRole('button', { name: /Дизайн/ }))
  fireEvent.click(toggle)
  expect(localStorage.getItem('cv-form-hidden')).toBe('hidden')
  fireEvent.click(
    within(document.querySelector<HTMLElement>('.section-nav')!).getByRole(
      'button',
      { name: /Опыт работы/ },
    ),
  )
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(
    screen.getByRole('heading', { name: 'Опыт работы' }),
  ).toBeInTheDocument()
  // The divider adjusts the width from the keyboard and closes the form below its minimum.
  const divider = screen.getByRole('separator', { name: 'Ширина формы' })
  fireEvent.keyDown(divider, { key: 'Home' })
  expect(Number(localStorage.getItem('cv-form-width'))).toBe(340)
  fireEvent.keyDown(divider, { key: 'ArrowLeft' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  fireEvent.keyDown(divider, { key: 'Enter' })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
})
it('keeps writing guidance tucked away until it is opened', async () => {
  localStorage.removeItem('cv-guide')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  const toggle = screen.getByRole('button', {
    name: 'Как заполнить этот раздел',
  })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByText(/Укажите должность/)).not.toBeInTheDocument()
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(/Укажите должность/)).toBeVisible()
  expect(localStorage.getItem('cv-guide')).toBe('open')
})
it('offers to start an empty language version from a filled one', async () => {
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(await screen.findByRole('button', { name: /Новое резюме/ }))
  fireEvent.change(screen.getByLabelText('Имя и фамилия'), {
    target: { value: 'Никита' },
  })
  fireEvent.change(screen.getByLabelText('Должность или специализация'), {
    target: { value: 'Фронтенд-разработчик' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык резюме' }), {
    target: { value: 'bg' },
  })
  expect(screen.getByText('Версия «Български» пока пустая')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: /Скопировать текст/ }))
  expect(screen.getByLabelText('Должность или специализация')).toHaveValue(
    'Фронтенд-разработчик',
  )
  expect(screen.queryByText(/пока пустая/)).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Должность или специализация'), {
    target: { value: 'Frontend разработчик' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Язык резюме' }), {
    target: { value: 'ru' },
  })
  expect(screen.getByLabelText('Должность или специализация')).toHaveValue(
    'Фронтенд-разработчик',
  )
})
it('translates the interface into German while editing another version', async () => {
  localStorage.setItem('cv-locale', 'de')
  render(
    <MemoryRouter initialEntries={['/edit']}>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(
    await screen.findByRole('button', { name: /Mit einem Beispiel beginnen/ }),
  )
  expect(screen.getByLabelText('Vollständiger Name')).toHaveValue('Alex Morgan')
  expect(
    screen.getByRole('combobox', { name: 'Sprache des Lebenslaufs' }),
  ).toHaveValue('de')
})
