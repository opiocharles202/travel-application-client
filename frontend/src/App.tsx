import { Route, Routes } from 'react-router'
import { ComponentCatalog } from './pages/ComponentCatalog'

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas" data-portal="public">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary">Uganda Paygate</h1>
        <p className="mt-2 text-sm text-muted">
          Frontend scaffold: routing, server state, forms and styling are wired.
        </p>
      </div>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dev/component-catalog" element={<ComponentCatalog />} />
    </Routes>
  )
}

export default App
