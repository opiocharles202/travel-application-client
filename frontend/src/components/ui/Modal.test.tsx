import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal (spec 0003)', () => {
  it('renders nothing when closed, the title and children when open', () => {
    const { rerender } = render(
      <Modal open={false} onOpenChange={() => {}} title="Confirm cancellation">
        <p>Body content</p>
      </Modal>,
    )
    expect(screen.queryByText('Confirm cancellation')).not.toBeInTheDocument()

    rerender(
      <Modal open onOpenChange={() => {}} title="Confirm cancellation">
        <p>Body content</p>
      </Modal>,
    )
    expect(screen.getByText('Confirm cancellation')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('renders the description only when provided', () => {
    render(
      <Modal open onOpenChange={() => {}} title="Confirm" description="This cannot be undone.">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('AC-5: Escape closes the modal (keyboard operable, no mouse-only affordance)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Modal open onOpenChange={onOpenChange} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('AC-5: the close button is reachable by keyboard and has an accessible name', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Modal open onOpenChange={onOpenChange} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    const closeButton = screen.getByRole('button', { name: 'Close' })
    closeButton.focus()
    expect(closeButton).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('focus moves into the dialog when it opens (focus trap, not left on the trigger)', () => {
    render(
      <Modal open onOpenChange={() => {}} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
  })
})
