import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
// Self-hosted fonts (spec 0003): satisfies the CSP's font-src 'self' (spec
// 0001); no request ever leaves the app's own origin. Latin subset only
// (the product ships English copy for the Uganda/Kenya/Tanzania market);
// the unscoped .css files pull every unicode subset (cyrillic, greek,
// vietnamese, math), which bloats every page load for nothing this
// product needs. Weights 400/500/700 cover body, medium emphasis, bold.
import '@fontsource/roboto/latin-400.css'
import '@fontsource/roboto/latin-500.css'
import '@fontsource/roboto/latin-700.css'
import '@fontsource/source-sans-pro/latin-400.css'
import '@fontsource/source-sans-pro/latin-600.css'
import '@fontsource/source-sans-pro/latin-700.css'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
import { queryClient } from './lib/query-client.ts'
import { enableMockingIfConfigured } from './mocks/enable.ts'

// Must resolve before the first render, so no data-fetching component can
// race the mock worker's registration (spec 0002).
await enableMockingIfConfigured()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
