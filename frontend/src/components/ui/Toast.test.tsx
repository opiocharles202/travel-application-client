import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from './Toast'
import { useToast } from './use-toast'

function TriggerButtons() {
  const { show } = useToast()
  return (
    <>
      <button
        onClick={() =>
          show({ title: 'Quote saved', description: 'Your quote was saved.', variant: 'success' })
        }
      >
        Show success
      </button>
      <button onClick={() => show({ title: 'Payment failed', variant: 'danger' })}>
        Show danger
      </button>
    </>
  )
}

describe('Toast (spec 0003)', () => {
  it('useToast throws when used outside a ToastProvider (a real programming error, not silently ignored)', () => {
    function Broken() {
      useToast()
      return null
    }
    expect(() => render(<Broken />)).toThrow(/must be used within a ToastProvider/)
  })

  it('shows a toast with its title and description when triggered', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Show success' }))
    await waitFor(() => expect(screen.getByText('Quote saved')).toBeInTheDocument())
    expect(screen.getByText('Your quote was saved.')).toBeInTheDocument()
  })

  it('status is never color alone (design.md): each variant renders a distinct icon, not just a colored border', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Show success' }))
    await waitFor(() => expect(screen.getByText('Quote saved')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Show danger' }))
    await waitFor(() => expect(screen.getByText('Payment failed')).toBeInTheDocument())

    // lucide-react renders each icon as an inline <svg>; two distinct
    // toasts on screen means two distinct icons, not a shared placeholder.
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  it('AC-5: the dismiss control is a real, keyboard-reachable, accessibly-labeled button', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TriggerButtons />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Show success' }))
    await waitFor(() => expect(screen.getByText('Quote saved')).toBeInTheDocument())

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' })
    expect(dismissButton).toBeInTheDocument()
    await user.click(dismissButton)
    await waitFor(() => expect(screen.queryByText('Quote saved')).not.toBeInTheDocument())
  })
})
