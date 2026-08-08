import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

/**
 * Static per-portal nav (spec 0004). Sourced from the scoped admin/broker
 * features (docs/scope/scope.md, features 12-21), not the full legacy
 * sitemap: a nav item only exists here once its page is a real scoped
 * feature. Genuine permission-based filtering is a Follow-up once a real
 * permissions data source exists (spec 0004, Follow-up); every item is
 * shown unconditionally for now.
 */
export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Quotations', href: '/admin/quotations', icon: FileText },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Agents & brokers', href: '/admin/agents', icon: Briefcase },
  { label: 'Corporate accounts', href: '/admin/corporate-accounts', icon: Building2 },
  { label: 'Staff & settings', href: '/admin/settings', icon: UserCog },
]

export const brokerNav: NavItem[] = [
  { label: 'Dashboard', href: '/broker', icon: LayoutDashboard },
  { label: 'Bookings', href: '/broker/bookings', icon: FileText },
  { label: 'Corporate accounts', href: '/broker/corporate-accounts', icon: Building2 },
]
