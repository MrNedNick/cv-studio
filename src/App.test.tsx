import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { loadDocument, saveDocument } from './storage'
import { createDocument } from './model'
vi.mock('./Preview', () => ({ default: () => <div>PDF preview</div> }))
vi.mock('./storage', () => ({
  loadDocument: vi.fn(async () => null),
  saveDocument: vi.fn(async () => undefined),
}))
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
  }
})
beforeEach(() => vi.clearAllMocks())
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
  fireEvent.click(
    screen.getByRole('button', { name: 'Switch to English version' }),
  )
  expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
  expect(screen.getByLabelText('Full name')).toHaveValue('Alex Morgan')
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
  fireEvent.click(
    screen.getByRole('button', { name: 'Switch to English version' }),
  )
  expect(screen.getByLabelText('Start date')).toHaveValue('2024-01')
  expect(screen.getByLabelText('Present')).toBeChecked()
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
  expect(await screen.findByLabelText('Full name')).toHaveValue('Imported')
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
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
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
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
  vi.mocked(loadDocument).mockResolvedValueOnce(createDocument(true))
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
