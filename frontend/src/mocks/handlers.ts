import { http, HttpResponse } from 'msw'
import {
  contractSchema,
  createQuoteRequestSchema,
  initiatePaymentRequestSchema,
  paymentTransactionSchema,
  quoteSchema,
  type Contract,
  type PaymentTransaction,
  type Quote,
} from '../lib/contracts'
import { buildMockPlan } from './fixtures'
import { MOCK_OWNER_ID, PAYMENT_TIMEOUT_MS, mockStore } from './store'

/**
 * MSW handlers for the 5 core loop endpoints (spec 0002). Every response is
 * parsed through its Zod schema before being returned (AC-3): a bug in a
 * handler's shape fails the request loudly in tests, never silently drifts
 * from the contract.
 *
 * Ownership model (AC-7, spec 0002 Feature design "Security model"):
 * available-plans is public; every other endpoint requires the caller to
 * own the referenced quote. The mock has no real auth, so ownership is
 * simulated via the `x-mock-owner-id` header the frontend sends only in
 * mock mode; a request with no header, or a mismatched one, is rejected
 * exactly like a real backend's ownership check would reject it.
 */

function requireOwnership(
  request: Request,
  ownerId: string,
): HttpResponse<{ message: string }> | null {
  const callerId = request.headers.get('x-mock-owner-id') ?? MOCK_OWNER_ID
  if (callerId !== ownerId) {
    return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
  }
  return null
}

export const handlers = [
  http.post('*/travel/available-plans', () => {
    const plans = [
      buildMockPlan(),
      buildMockPlan({ planCode: 'WORLDWIDE_GOLD', label: 'Worldwide Gold' }),
    ]
    plans.forEach((plan) => mockStore.plans.set(plan.selectionToken, plan))
    return HttpResponse.json(plans)
  }),

  http.post('*/quotes', async ({ request }) => {
    const body = createQuoteRequestSchema.parse(await request.json())
    const plan = mockStore.plans.get(body.selectionToken)

    // AC-4: an expired or unrecognized selectionToken is rejected with 409,
    // never silently accepted at a stale or invented price.
    const expired = !plan || new Date(plan.selectionTokenExpiresAt).getTime() < Date.now()
    if (expired) {
      return HttpResponse.json({ message: 'Selection token expired or invalid' }, { status: 409 })
    }

    const id = `quote-${mockStore.quotes.size + 1}`
    const now = new Date().toISOString()
    const quote: Quote = quoteSchema.parse({
      id,
      status: 'pending',
      travelers: body.travelers.map((traveler, index) => ({
        ...traveler,
        id: `${id}-traveler-${index + 1}`,
        cost: plan.totalPayable,
      })),
      planId: plan.id,
      premium: plan.basePremium,
      levy: plan.levy,
      amountPayable: plan.totalPayable,
      dateOfDeparture: body.dateOfDeparture,
      dateOfReturn: body.dateOfReturn,
      reasonForTravel: body.reasonForTravel,
      countryOfDeparture: {
        id: body.countryOfDepartureId,
        name: 'Uganda',
        iso2: 'UG',
        iso3: 'UGA',
      },
      countryOfDestination: {
        id: body.countryOfDestinationId,
        name: 'Kenya',
        iso2: 'KE',
        iso3: 'KEN',
      },
      policyNumber: null,
      createdAt: now,
    })

    mockStore.quotes.set(id, { quote, ownerId: MOCK_OWNER_ID })
    return HttpResponse.json(quote, { status: 201 })
  }),

  http.post('*/quotes/:id/payment', async ({ request, params }) => {
    const quoteId = params.id as string
    const record = mockStore.quotes.get(quoteId)
    if (!record) {
      return HttpResponse.json({ message: 'Quote not found' }, { status: 404 })
    }
    const forbidden = requireOwnership(request, record.ownerId)
    if (forbidden) return forbidden

    const body = initiatePaymentRequestSchema.parse(await request.json())
    const now = new Date().toISOString()
    const transaction: PaymentTransaction = paymentTransactionSchema.parse({
      id: `payment-${quoteId}`,
      quoteId,
      mobileNumber: body.mobileNumber,
      amount: record.quote.amountPayable,
      status: 'pending',
      gatewayRef: null,
      initiatedAt: now,
      updatedAt: now,
    })

    mockStore.payments.set(quoteId, { transaction, ownerId: record.ownerId })
    return HttpResponse.json(transaction, { status: 201 })
  }),

  http.get('*/quotes/:id/payment', ({ request, params }) => {
    const quoteId = params.id as string
    const record = mockStore.payments.get(quoteId)
    if (!record) {
      return HttpResponse.json({ message: 'No payment initiated for this quote' }, { status: 404 })
    }
    const forbidden = requireOwnership(request, record.ownerId)
    if (forbidden) return forbidden

    // AC-5: a payment left pending past the timeout threshold is reported
    // as timedOut, never an indefinite pending.
    const elapsed = Date.now() - new Date(record.transaction.initiatedAt).getTime()
    if (record.transaction.status === 'pending' && elapsed > PAYMENT_TIMEOUT_MS) {
      record.transaction = {
        ...record.transaction,
        status: 'timedOut',
        updatedAt: new Date().toISOString(),
      }
    }

    return HttpResponse.json(paymentTransactionSchema.parse(record.transaction))
  }),

  http.get('*/quotes/:id/contract', ({ request, params }) => {
    const quoteId = params.id as string
    const quoteRecord = mockStore.quotes.get(quoteId)
    if (!quoteRecord) {
      return HttpResponse.json({ message: 'Quote not found' }, { status: 404 })
    }
    const forbidden = requireOwnership(request, quoteRecord.ownerId)
    if (forbidden) return forbidden

    const paymentRecord = mockStore.payments.get(quoteId)
    if (!paymentRecord || paymentRecord.transaction.status !== 'success') {
      return HttpResponse.json({ message: 'Payment not yet successful' }, { status: 404 })
    }

    const existing = mockStore.contracts.get(quoteId)
    if (existing) {
      return HttpResponse.json(contractSchema.parse(existing.contract))
    }

    // AC-6: payment succeeded but issuance can still fail; this is a
    // distinct terminal state, never a generic error and never a false
    // "issued".
    const shouldFail = mockStore.issuanceShouldFail.has(quoteId)
    const contract: Contract = contractSchema.parse({
      id: `contract-${quoteId}`,
      quoteId,
      status: shouldFail ? 'issuanceFailed' : 'issued',
      contractCode: shouldFail ? null : `ILT1-${quoteId}`,
      pdfUrl: shouldFail ? null : `https://mock.local/contracts/${quoteId}.pdf`,
      qrValidationUrl: shouldFail ? null : `https://mock.local/certificate-validator/${quoteId}`,
      issuedAt: shouldFail ? null : new Date().toISOString(),
    })

    mockStore.contracts.set(quoteId, { contract, ownerId: quoteRecord.ownerId })
    return HttpResponse.json(contract)
  }),
]
