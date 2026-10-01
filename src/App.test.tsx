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
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'
vi.mock('./Preview', () => ({ default: () => <div>PDF preview</div> }))
vi.mock('./storage', () => ({
  loadDocument: vi.fn(async () => null),
  saveDocument: vi.fn(async () => undefined),
}))
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
