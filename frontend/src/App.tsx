import { Route, Routes } from 'react-router'
import { AppShell } from './components/shell/AppShell'
import { ComponentCatalog } from './pages/ComponentCatalog'

function Home() {
  return (
    <AppShell variant="public">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-primary">Uganda Paygate</h1>
        <p className="mt-2 text-sm text-muted">
          Frontend scaffold: routing, server state, forms and styling are wired.
        </p>
      </div>
    </AppShell>
  )
}

/**
 * Placeholder pages proving the admin/broker shell wraps real routes
 * (spec 0004). Real screens land with scope features 11-21; this is not
 * one of them.
 */
function AdminPlaceholder() {
  return (
    <AppShell variant="admin">
      <p className="text-sm text-muted">Admin dashboard (scope feature 12, not yet built).</p>
    </AppShell>
  )
}

function BrokerPlaceholder() {
  return (
    <AppShell variant="broker">
      <p className="text-sm text-muted">Broker dashboard (scope feature 19, not yet built).</p>
    </AppShell>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminPlaceholder />} />
      <Route path="/broker" element={<BrokerPlaceholder />} />
      <Route path="/dev/component-catalog" element={<ComponentCatalog />} />
    </Routes>
  )
}

export default App
