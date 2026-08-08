import * as ToastPrimitive from '@radix-ui/react-toast'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Density } from './types'
import { ToastContext, type ToastItem, type ToastVariant } from './use-toast'

const variantIcon: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: AlertCircle,
}

// Status is never color alone (design.md): every toast carries an icon
// matching its variant, not just a colored border.
const variantClasses: Record<ToastVariant, string> = {
  success: 'border-l-4 border-l-success text-on-success',
  danger: 'border-l-4 border-l-danger text-on-danger',
}

const densityClasses: Record<Density, string> = {
  comfortable: 'p-4',
  compact: 'p-2',
}

export function ToastProvider({
  children,
  density = 'comfortable',
}: {
  children: ReactNode
  density?: Density
}): ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { ...toast, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => {
          const Icon = variantIcon[toast.variant]
          return (
            <ToastPrimitive.Root
              key={toast.id}
              open
              onOpenChange={(open) => {
                if (!open) dismiss(toast.id)
              }}
              className={cn(
                'flex items-start gap-3 rounded-md bg-canvas shadow',
                variantClasses[toast.variant],
                densityClasses[density],
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <ToastPrimitive.Title className="text-sm font-medium">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description && (
                  <ToastPrimitive.Description className="mt-1 text-sm">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                aria-label="Dismiss"
                className={cn(
                  'rounded-md p-1 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
                )}
              >
                <X className="size-4" aria-hidden="true" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}
        <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-50 m-4 flex w-96 max-w-full flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
