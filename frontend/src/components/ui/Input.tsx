import * as LabelPrimitive from '@radix-ui/react-label'
import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  density?: Density
  /** When set, the input renders in an error state: visual AND
   *  aria-invalid + aria-describedby (spec 0003, AC-7), never color alone. */
  error?: string
}

const densityClasses: Record<Density, string> = {
  comfortable: 'py-3 px-4 text-base',
  compact: 'py-1 px-3 text-sm',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, density = 'comfortable', error, id, className, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="flex flex-col gap-1">
        <LabelPrimitive.Root htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </LabelPrimitive.Root>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'rounded-md border bg-canvas text-body transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text',
            error ? 'border-danger' : 'border-border-strong',
            densityClasses[density],
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
