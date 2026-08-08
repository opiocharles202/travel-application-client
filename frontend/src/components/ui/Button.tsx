import { Slot } from '@radix-ui/react-slot'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  density?: Density
  /** Render as the child element instead of a <button> (e.g. wrapping a Link). */
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  // Accent (gold) is reserved for primary calls to action only (design.md).
  primary: 'bg-accent text-on-accent hover:bg-accent-light',
  secondary: 'bg-transparent text-primary border border-border-strong hover:bg-surface',
  danger: 'bg-danger text-on-danger hover:brightness-95',
}

const densityClasses: Record<Density, string> = {
  comfortable: 'py-3 px-4 text-base',
  compact: 'py-1 px-3 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', density = 'comfortable', asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
          // A dedicated disabled pairing, not opacity on the variant color
          // (opacity-50 on the gold accent measured ~2.13:1, well under AA;
          // body-on-surface clears 9.13:1 regardless of variant).
          'disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-transparent',
          variantClasses[variant],
          densityClasses[density],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
