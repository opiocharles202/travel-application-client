import type { ReactNode } from 'react'

/**
 * Public site chrome (spec 0004, AC-1): header, content, footer. Matches
 * design.md's composition pattern (centered content, footer present on
 * every page, Roboto typography).
 */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" data-portal="public">
      <header className="border-b border-border bg-canvas px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-primary">Uganda Paygate</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface px-6 py-8 text-sm text-muted">
        <div className="mx-auto max-w-5xl">
          <p>&copy; {new Date().getFullYear()} ICEA LION. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
