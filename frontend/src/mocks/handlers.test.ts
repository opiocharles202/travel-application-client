import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setAccessToken } from '../lib/api-client'
import {
  createQuote,
  getAvailablePlans,
  getContract,
  getPaymentStatus,
  initiatePayment,
  SelectionTokenExpiredError,
} from '../lib/api/travel'
import { OTHER_OWNER_ID, mockStore } from './store'

/**
 * Exercises the mock layer through the real apiClient / API functions
 * (spec 0002, AC-3 through AC-8): these tests prove the whole thin thread
 * (schema -> apiClient -> MSW handler -> schema) actually works, not just
 * that individual schemas parse in isolation.
 */

function buildAvailablePlansRequest() {
  return {
    countryOfDepartureId: 'ug',
    countryOfDestinationId: 'ke',
    dateOfDeparture: '2026-09-01',
    dateOfReturn: '2026-09-10',
    travelerDobs: ['1990-01-01'],
    tripType: 'SINGLETRIP' as const,
  }
}

function buildTraveler() {
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    otherName: null,
    dob: '1990-01-01',
    nationality: 'Ugandan',
    passportNumber: 'A1234567',
    idNumber: null,
    phone: '256700000000',
    email: 'ada@example.com',
    postalAddress: null,
    nextOfKin: null,
    gender: 'female' as const,
    passportExpiry: '2030-01-01',
  }
}

beforeEach(() => {
  setAccessToken('mock-token')
})

afterEach(() => {
  setAccessToken(null)
})

describe('core loop mock handlers', () => {
  it('AC-3: available plans is public and returns schema-honest plans', async () => {
    const plans = await getAvailablePlans(buildAvailablePlansRequest())
    expect(plans.length).toBeGreaterThan(0)
    expect(plans[0]).toHaveProperty('selectionToken')
  })

  it('AC-3, happy path: quote -> payment -> issued contract works end to end', async () => {
    const [plan] = await getAvailablePlans(buildAvailablePlansRequest())
    const quote = await createQuote({
      planId: plan!.id,
      selectionToken: plan!.selectionToken,
      travelers: [buildTraveler()],
      reasonForTravel: 'leisure',
      dateOfDeparture: '2026-09-01',
      dateOfReturn: '2026-09-10',
      countryOfDepartureId: 'ug',
      countryOfDestinationId: 'ke',
    })
    expect(quote.status).toBe('pending')

    const payment = await initiatePayment(quote.id, { mobileNumber: '256700000000' })
    expect(payment.status).toBe('pending')

    // Simulate the gateway confirming success (a real backend would flip
    // this via its own webhook/poll; the mock exposes the same seam).
    const record = mockStore.payments.get(quote.id)
    if (record) record.transaction = { ...record.transaction, status: 'success' }

    const status = await getPaymentStatus(quote.id)
    expect(status.status).toBe('success')

    const contract = await getContract(quote.id)
    expect(contract.status).toBe('issued')
    expect(contract.pdfUrl).not.toBeNull()
  })

  it('AC-4: creating a quote with an expired selection token throws SelectionTokenExpiredError', async () => {
    const [plan] = await getAvailablePlans(buildAvailablePlansRequest())
    const expiredPlan = mockStore.plans.get(plan!.selectionToken)!
    mockStore.plans.set(plan!.selectionToken, {
      ...expiredPlan,
      selectionTokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
    })

    await expect(
      createQuote({
        planId: plan!.id,
        selectionToken: plan!.selectionToken,
        travelers: [buildTraveler()],
        reasonForTravel: 'leisure',
        dateOfDeparture: '2026-09-01',
        dateOfReturn: '2026-09-10',
        countryOfDepartureId: 'ug',
        countryOfDestinationId: 'ke',
      }),
    ).rejects.toBeInstanceOf(SelectionTokenExpiredError)
  })

  it('AC-5: a payment left pending past the timeout is reported as timedOut', async () => {
    const [plan] = await getAvailablePlans(buildAvailablePlansRequest())
    const quote = await createQuote({
      planId: plan!.id,
      selectionToken: plan!.selectionToken,
      travelers: [buildTraveler()],
      reasonForTravel: 'leisure',
      dateOfDeparture: '2026-09-01',
      dateOfReturn: '2026-09-10',
      countryOfDepartureId: 'ug',
      countryOfDestinationId: 'ke',
    })
    await initiatePayment(quote.id, { mobileNumber: '256700000000' })

    const record = mockStore.payments.get(quote.id)!
    record.transaction = {
      ...record.transaction,
      initiatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    }

    const status = await getPaymentStatus(quote.id)
    expect(status.status).toBe('timedOut')
  })

  it('AC-6: a successful payment with failed issuance returns issuanceFailed, never a false issued', async () => {
    const [plan] = await getAvailablePlans(buildAvailablePlansRequest())
    const quote = await createQuote({
      planId: plan!.id,
      selectionToken: plan!.selectionToken,
      travelers: [buildTraveler()],
      reasonForTravel: 'leisure',
      dateOfDeparture: '2026-09-01',
      dateOfReturn: '2026-09-10',
      countryOfDepartureId: 'ug',
      countryOfDestinationId: 'ke',
    })
    await initiatePayment(quote.id, { mobileNumber: '256700000000' })
    const record = mockStore.payments.get(quote.id)!
    record.transaction = { ...record.transaction, status: 'success' }
    mockStore.issuanceShouldFail.add(quote.id)

    const contract = await getContract(quote.id)
    expect(contract.status).toBe('issuanceFailed')
    expect(contract.pdfUrl).toBeNull()
  })

  it('AC-7: a non-owner cannot fetch another client’s payment status', async () => {
    const [plan] = await getAvailablePlans(buildAvailablePlansRequest())
    const quote = await createQuote({
      planId: plan!.id,
      selectionToken: plan!.selectionToken,
      travelers: [buildTraveler()],
      reasonForTravel: 'leisure',
      dateOfDeparture: '2026-09-01',
      dateOfReturn: '2026-09-10',
      countryOfDepartureId: 'ug',
      countryOfDestinationId: 'ke',
    })
    await initiatePayment(quote.id, { mobileNumber: '256700000000' })

    // Exercises the real handler's ownership check directly: a raw request
    // carrying a different caller's id must be rejected, not apiClient's
    // own behavior (apiClient has no concept of "which mock owner" and
    // isn't meant to; that header only exists to let this mock simulate
    // ownership since the mock has no real auth server behind it).
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/quotes/${quote.id}/payment`,
      { headers: { 'x-mock-owner-id': OTHER_OWNER_ID } },
    )
    expect(response.status).toBe(403)
  })

  it('AC-7: available plans requires no ownership at all', async () => {
    setAccessToken(null)
    const plans = await getAvailablePlans(buildAvailablePlansRequest())
    expect(plans.length).toBeGreaterThan(0)
  })
})
