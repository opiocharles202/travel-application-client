import type { ReactNode } from 'react'
import { adminNav, brokerNav } from './nav-config'
import { PortalShell } from './PortalShell'
import { PublicShell } from './PublicShell'

export type AppShellVariant = 'public' | 'admin' | 'broker'

export interface AppShellProps {
  variant: AppShellVariant
  children: ReactNode
}

/**
 * The one shell every page renders inside (spec 0004), replacing the
 * legacy app's 8 duplicate layout files. Purely presentational: it has no
 * opinion on whether the current user may be here. Authentication and
 * route guarding are explicitly out of scope for this feature (see spec
 * 0004's Follow-up) and belong to whichever feature builds login.
 */
export function AppShell({ variant, children }: AppShellProps) {
  switch (variant) {
    case 'public':
      return <PublicShell>{children}</PublicShell>
    case 'admin':
      return (
        <PortalShell portal="admin" portalLabel="Admin" nav={adminNav}>
          {children}
        </PortalShell>
      )
    case 'broker':
      return (
        <PortalShell portal="broker" portalLabel="Broker" nav={brokerNav}>
          {children}
        </PortalShell>
      )
  }
}
