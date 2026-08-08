import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps {
  steps: StepperStep[]
  currentStepId: string
  /** A step is only clickable if it's already been reached (a completed step
   *  or the current one); future steps stay non-interactive so a user can't
   *  skip ahead of required data (e.g. the quote wizard's traveler details). */
  reachedStepIds: string[]
  onStepSelect?: (id: string) => void
  density?: Density
}

const densityClasses: Record<Density, string> = {
  comfortable: 'size-8 text-sm',
  compact: 'size-6 text-xs',
}

export function Stepper({
  steps,
  currentStepId,
  reachedStepIds,
  onStepSelect,
  density = 'comfortable',
}: StepperProps): ReactNode {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId)

  return (
    <ol className="flex items-center" aria-label="Progress">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = step.id === currentStepId
        const isReached = reachedStepIds.includes(step.id)
        const isClickable = isReached && onStepSelect !== undefined

        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => isClickable && onStepSelect?.(step.id)}
                className={cn(
                  'flex items-center justify-center rounded-full font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
                  'disabled:cursor-default',
                  densityClasses[density],
                  isCompleted && 'bg-primary text-on-primary',
                  isCurrent && 'bg-accent text-on-accent',
                  !isCompleted && !isCurrent && 'border border-border-strong text-muted',
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
                <span className="sr-only">
                  {step.label}, step {index + 1} of {steps.length}
                  {isCurrent ? ', current step' : isCompleted ? ', completed' : ''}
                </span>
              </button>
              <span className="text-xs text-muted">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn('mx-2 h-px flex-1', isCompleted ? 'bg-primary' : 'bg-border')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
