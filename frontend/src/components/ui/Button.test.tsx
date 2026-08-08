import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button (spec 0003)', () => {
  it('renders each variant and density without crashing', () => {
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary" density="compact">
          Secondary
        </Button>
        <Button variant="danger">Danger</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Danger' })).toBeInTheDocument()
  })

  it('AC-5: is reachable and activatable by keyboard alone', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Get a quote</Button>)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Get a quote' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('AC-5: a disabled button is not reachable by Tab', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Button disabled>Disabled</Button>
        <Button>Next</Button>
      </>,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('does not rely on opacity for the disabled state (contrast fix, spec 0003)', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button.className).not.toMatch(/opacity-50/)
    expect(button.className).toMatch(/disabled:bg-disabled-bg/)
  })
})
