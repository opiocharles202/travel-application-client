import { planSchema, type Plan } from '../lib/contracts'

let planCounter = 0

/**
 * Builds a schema-honest mock Plan (spec 0002, AC-3: a mocked response can
 * never itself violate the contract). Parsed through planSchema before
 * being returned so a typo here fails loudly in tests, not silently.
 */
export function buildMockPlan(overrides: Partial<Plan> = {}): Plan {
  planCounter += 1
  const now = Date.now()
  const candidate: Plan = {
    id: `plan-${planCounter}`,
    planCode: 'WORLDWIDE_SILVER',
    label: 'Worldwide Silver',
    zone: 'WORLDWIDE',
    currency: 'UGX',
    basePremium: { amount: 180000, currency: 'UGX' },
    levy: { amount: 8100, currency: 'UGX' },
    addOns: {
      covid: { enabled: false, premium: { amount: 20000, currency: 'UGX' } },
      winterSport: { enabled: false, premium: { amount: 40000, currency: 'UGX' } },
      golf: { enabled: false, premium: { amount: 10000, currency: 'UGX' } },
    },
    totalPayable: { amount: 188100, currency: 'UGX' },
    selectionToken: `token-${planCounter}-${now}`,
    selectionTokenExpiresAt: new Date(now + 15 * 60 * 1000).toISOString(),
    ...overrides,
  }
  return planSchema.parse(candidate)
}
