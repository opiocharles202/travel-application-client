import type { Contract, PaymentTransaction, Plan, Quote } from '../lib/contracts'

/**
 * In-memory mock backend state (spec 0002). Deliberately simple: one
 * "current user" id per mock session, plain maps keyed by id. This is a
 * mock, not a database; it exists only to let the handlers simulate a
 * real lifecycle (quote -> payment -> contract) across requests.
 */

export const MOCK_OWNER_ID = 'mock-client-1'
export const OTHER_OWNER_ID = 'mock-client-2'

export const PAYMENT_TIMEOUT_MS = 2 * 60 * 1000

interface QuoteRecord {
  quote: Quote
  ownerId: string
}

interface PaymentRecord {
  transaction: PaymentTransaction
  ownerId: string
}

interface ContractRecord {
  contract: Contract
  ownerId: string
}

class MockStore {
  plans = new Map<string, Plan>()
  quotes = new Map<string, QuoteRecord>()
  payments = new Map<string, PaymentRecord>()
  contracts = new Map<string, ContractRecord>()
  /** quoteId -> whether this quote's contract issuance should fail (test hook) */
  issuanceShouldFail = new Set<string>()

  reset() {
    this.plans.clear()
    this.quotes.clear()
    this.payments.clear()
    this.contracts.clear()
    this.issuanceShouldFail.clear()
  }
}

export const mockStore = new MockStore()
