import * as LabelPrimitive from '@radix-ui/react-label'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: string
  options: SelectOption[]
  value?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
  placeholder?: string | undefined
  density?: Density | undefined
  /** Visual + aria-invalid + aria-describedby error state (spec 0003, AC-7). */
  error?: string | undefined
  disabled?: boolean | undefined
}

const densityClasses: Record<Density, string> = {
  comfortable: 'py-3 px-4 text-base',
  compact: 'py-1 px-3 text-sm',
}

const densityItemClasses: Record<Density, string> = {
  comfortable: 'py-2 px-4 text-base',
  compact: 'py-1 px-3 text-sm',
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  density = 'comfortable',
  error,
  disabled,
}: SelectProps): ReactNode {
  const generatedId = useId()
  const triggerId = generatedId
  const errorId = `${triggerId}-error`

  const rootProps: SelectPrimitive.SelectProps = {
    disabled: disabled ?? false,
    ...(value !== undefined ? { value } : {}),
    ...(onValueChange !== undefined ? { onValueChange } : {}),
  }

  return (
    <div className="flex flex-col gap-1">
      <LabelPrimitive.Root htmlFor={triggerId} className="text-sm font-medium text-ink">
        {label}
      </LabelPrimitive.Root>
      <SelectPrimitive.Root {...rootProps}>
        <SelectPrimitive.Trigger
          id={triggerId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'flex items-center justify-between rounded-md border bg-canvas text-body transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text',
            error ? 'border-danger' : 'border-border-strong',
            densityClasses[density],
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="size-4 text-muted" aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="overflow-hidden rounded-md border border-border bg-canvas shadow">
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 outline-none data-[highlighted]:bg-surface',
                    densityItemClasses[density],
                  )}
                >
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
