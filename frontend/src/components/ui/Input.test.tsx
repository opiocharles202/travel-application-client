import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input (spec 0003)', () => {
  it('associates its visible label with the field via htmlFor/id', () => {
    render(<Input label="Traveler name" />)
    expect(screen.getByLabelText('Traveler name')).toBeInTheDocument()
  })

  it('AC-7: an error is exposed both visually and to assistive technology, never color alone', () => {
    render(<Input label="Passport number" error="Passport number is required" />)
    const input = screen.getByLabelText('Passport number')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const message = document.getElementById(describedBy!)
    expect(message).toHaveTextContent('Passport number is required')
  })

  it('has no aria-invalid or aria-describedby when there is no error', () => {
    render(<Input label="Traveler name" />)
    const input = screen.getByLabelText('Traveler name')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('AC-5: is reachable by keyboard and accepts typed input', async () => {
    const user = userEvent.setup()
    render(<Input label="Traveler name" />)
    await user.tab()
    const input = screen.getByLabelText('Traveler name')
    expect(input).toHaveFocus()
    await user.keyboard('Ada Lovelace')
    expect(input).toHaveValue('Ada Lovelace')
  })
})
