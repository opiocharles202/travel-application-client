import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'danger'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

export interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
