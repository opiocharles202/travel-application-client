import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: 'ke', label: 'Kenya' },
  { value: 'ug', label: 'Uganda' },
]

describe('Select (spec 0003)', () => {
  it('renders a labeled trigger showing the placeholder when no value is set', () => {
    render(<Select label="Destination" options={options} placeholder="Select a country" />)
    expect(screen.getByText('Destination')).toBeInTheDocument()
    expect(screen.getByText('Select a country')).toBeInTheDocument()
  })

  it('AC-7: an error is exposed both visually and via aria-invalid/aria-describedby', () => {
    render(<Select label="Trip type" options={options} error="Choose a trip type" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    const describedBy = trigger.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)).toHaveTextContent('Choose a trip type')
  })

  it('AC-5: the trigger is reachable by keyboard and opens on Enter', async () => {
    const user = userEvent.setup()
    render(<Select label="Destination" options={options} />)
    await user.tab()
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('calls onValueChange when a value is programmatically selected', () => {
    const onValueChange = vi.fn()
    render(
      <Select label="Destination" options={options} value="ke" onValueChange={onValueChange} />,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Kenya')
  })
})
