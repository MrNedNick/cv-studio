import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SkillsField } from './SkillsField'

afterEach(cleanup)
function Skills() {
  const [value, setValue] = useState('Accessibility')
  return (
    <SkillsField
      value={value}
      onChange={setValue}
      locale="en"
      lang="en"
      jobTitle="Product designer"
    />
  )
}

it('keeps a skill draft while a composing keyboard confirms text', () => {
  render(<Skills />)
  const input = screen.getByLabelText('Your skills')
  fireEvent.change(input, { target: { value: '設計' } })
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
  expect(input).toHaveValue('設計')
  expect(
    screen.queryByRole('button', { name: 'Remove “設計”' }),
  ).not.toBeInTheDocument()
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
  expect(input).toHaveValue('設計')
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(
    screen.getByRole('button', { name: 'Remove “設計”' }),
  ).toBeInTheDocument()
  expect(input).toHaveValue('')
})

it('deduplicates pasted skills and allows removing the last chip from the keyboard', () => {
  render(<Skills />)
  const input = screen.getByLabelText('Your skills')
  fireEvent.change(input, {
    target: { value: 'accessibility, Research, research,' },
  })
  expect(screen.getAllByRole('button', { name: /Remove “/ })).toHaveLength(2)
  fireEvent.keyDown(input, { key: 'Backspace', isComposing: true })
  expect(
    screen.getByRole('button', { name: 'Remove “Research”' }),
  ).toBeInTheDocument()
  fireEvent.keyDown(input, { key: 'Backspace' })
  expect(
    screen.queryByRole('button', { name: 'Remove “Research”' }),
  ).not.toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove “Accessibility”' }),
  )
  expect(
    screen.queryByRole('list', { name: 'Added skills' }),
  ).not.toBeInTheDocument()
})

it('returns keyboard removal to writing and preserves long pasted skills', async () => {
  const user = userEvent.setup()
  render(<Skills />)
  const input = screen.getByLabelText('Your skills')
  const longSkill = 'TypeScript'.repeat(20)
  await user.click(input)
  await user.paste(`${longSkill}, Анализ данных,`)
  expect(
    screen.getByRole('button', { name: `Remove “${longSkill}”` }),
  ).toBeInTheDocument()
  const remove = screen.getByRole('button', { name: 'Remove “Accessibility”' })
  remove.focus()
  await user.keyboard('{Enter}')
  expect(input).toHaveFocus()
  await user.type(input, 'Research{Enter}')
  expect(
    screen.getByRole('button', { name: 'Remove “Research”' }),
  ).toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: `Remove “${longSkill}”` }),
    { detail: 0 },
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove “Анализ данных”' }),
    { detail: 0 },
  )
  fireEvent.click(screen.getByRole('button', { name: 'Remove “Research”' }), {
    detail: 0,
  })
  expect(input).toHaveFocus()
  expect(
    screen.queryByRole('list', { name: 'Added skills' }),
  ).not.toBeInTheDocument()
})
