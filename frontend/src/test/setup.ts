import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'
import { mockStore } from '../mocks/store'

// Intercepts fetch at the network level for the whole test run (spec 0002),
// so tests exercise the exact same code path a real backend response would.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  mockStore.reset()
})
afterAll(() => server.close())
