import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'
import { mockStore } from '../mocks/store'

// jsdom doesn't implement the Pointer Events capture API; several Radix UI
// primitives (Toast's swipe-to-dismiss, Select) call these unconditionally.
// Without this, an interaction test throws an unhandled exception even
// though the assertion itself passes (caught during /test, spec 0003).
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}

// Intercepts fetch at the network level for the whole test run (spec 0002),
// so tests exercise the exact same code path a real backend response would.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  mockStore.reset()
})
afterAll(() => server.close())
