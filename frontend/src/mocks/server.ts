import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Used by the Vitest setup file to intercept fetch in the test/Node environment. */
export const server = setupServer(...handlers)
