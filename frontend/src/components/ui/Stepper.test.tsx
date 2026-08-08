import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper } from './Stepper'

const steps = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'billing', label: 'Billing' },
]

describe('Stepper (spec 0003)', () => {
  it('marks the current step with aria-current', () => {
    render(
      <Stepper
        steps={steps}
        currentStepId="quotation"
        reachedStepIds={['itinerary', 'quotation']}
      />,
    )
    const current = screen.getByRole('button', { current: 'step' })
    expect(current).toHaveAccessibleName(/Quotation/)
  })

  it('AC-5: a reached step is a real, clickable, keyboard-operable control', async () => {
    const user = userEvent.setup()
    const onStepSelect = vi.fn()
    render(
      <Stepper
        steps={steps}
        currentStepId="quotation"
        reachedStepIds={['itinerary', 'quotation']}
        onStepSelect={onStepSelect}
      />,
    )
    const itineraryStep = screen.getByRole('button', { name: /Itinerary/ })
    itineraryStep.focus()
    await user.keyboard('{Enter}')
    expect(onStepSelect).toHaveBeenCalledWith('itinerary')
  })

  it('a step not yet reached is disabled, never clickable ahead of required data', () => {
    render(
      <Stepper
        steps={steps}
        currentStepId="quotation"
        reachedStepIds={['itinerary', 'quotation']}
      />,
    )
    const billingStep = screen.getByRole('button', { name: /Billing/ })
    expect(billingStep).toBeDisabled()
  })
})
