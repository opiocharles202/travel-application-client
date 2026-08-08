import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'
import type { NavItem } from './nav-config'

/**
 * Admin/broker shared chrome (spec 0004, AC-2): header, sidebar, content,
 * no footer. Matches design.md's composition pattern (full width, denser
 * default, Source Sans Pro typography). The same component serves both
 * portals; only the nav config and the portal label differ per instance.
 */
export function PortalShell({
  portal,
  portalLabel,
  nav,
  children,
}: {
  portal: 'admin' | 'broker'
  portalLabel: string
  nav: NavItem[]
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" data-portal={portal}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-canvas transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-base font-semibold text-primary">{portalLabel}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'rounded-md p-1 text-muted lg:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={`${portalLabel} navigation`} className="flex flex-col gap-1 p-2">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === `/${portal}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
                    isActive ? 'bg-primary text-on-primary' : 'text-body hover:bg-surface',
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-primary-dark/40 lg:hidden"
        />
      )}

      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="flex items-center gap-3 border-b border-border bg-canvas px-4 py-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className={cn(
              'rounded-md p-1 text-muted lg:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2',
            )}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-ink">{portalLabel}</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
