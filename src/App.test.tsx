import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import App from './App'

it('opens the editor route', () => {
  render(<MemoryRouter initialEntries={['/edit']}><App /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: 'Resume editor' })).toBeTruthy()
})
