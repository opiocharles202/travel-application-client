import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppShell } from './AppShell'
import { adminNav, brokerNav } from './nav-config'

function renderShell(variant: 'public' | 'admin' | 'broker', initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppShell variant={variant}>
        <p>Page content</p>
      </AppShell>
    </MemoryRouter>,
  )
}

describe('AppShell (spec 0004)', () => {
  it('AC-1: the public variant renders a header, children, and a footer, no sidebar nav', () => {
    renderShell('public')
    expect(screen.getByText('Uganda Paygate')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('AC-2: the admin variant renders a header, a sidebar nav, children, and no footer', () => {
    renderShell('admin')
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.queryByText(/All rights reserved/)).not.toBeInTheDocument()
  })

  it('AC-2: the broker variant renders its own sidebar nav and no footer', () => {
    renderShell('broker')
    expect(screen.getByRole('navigation', { name: 'Broker navigation' })).toBeInTheDocument()
    expect(screen.queryByText(/All rights reserved/)).not.toBeInTheDocument()
  })

  it('AC-3: admin and broker render distinct nav content from their own config', () => {
    renderShell('admin')
    for (const item of adminNav) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('link', { name: 'Bookings' })).not.toBeInTheDocument()
  })

  it('AC-3: broker nav is not the admin nav', () => {
    renderShell('broker')
    for (const item of brokerNav) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('link', { name: 'Staff & settings' })).not.toBeInTheDocument()
  })

  it('AC-4: every nav item is a real router link, not a bare anchor reload', () => {
    renderShell('admin')
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/ })
    expect(dashboardLink).toHaveAttribute('href', '/admin')
  })

  it('AC-5: the nav item matching the current route is visually marked active', () => {
    renderShell('admin', '/admin/quotations')
    const quotationsLink = screen.getByRole('link', { name: /Quotations/ })
    expect(quotationsLink.className).toMatch(/bg-primary/)
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/ })
    expect(dashboardLink.className).not.toMatch(/bg-primary/)
  })

  it('AC-7: every sidebar nav link is reachable by keyboard with a visible focus ring class', () => {
    renderShell('admin')
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.className).toMatch(/focus-visible:ring-2/)
    }
  })

  it('AC-8: the sidebar menu toggle opens and closes the mobile nav', async () => {
    const user = userEvent.setup()
    renderShell('admin')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })
})
