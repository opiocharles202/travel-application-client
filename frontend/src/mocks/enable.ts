/**
 * Starts the MSW browser worker when VITE_ENABLE_MOCKS is set (spec 0002).
 * Must resolve before the app renders its first data fetching component,
 * so main.tsx awaits this before calling createRoot(...).render(...).
 */
export async function enableMockingIfConfigured(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return
  }
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}
