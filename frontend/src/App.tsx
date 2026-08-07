import { Route, Routes } from 'react-router'

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#003764]">Uganda Paygate</h1>
        <p className="mt-2 text-sm text-neutral-500">
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
    </Routes>
  )
}

export default App
