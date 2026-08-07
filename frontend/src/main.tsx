import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/query-client.ts'
import { enableMockingIfConfigured } from './mocks/enable.ts'

// Must resolve before the first render, so no data-fetching component can
// race the mock worker's registration (spec 0002).
await enableMockingIfConfigured()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
