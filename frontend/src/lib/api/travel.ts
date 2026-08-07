import { z } from 'zod'
import { apiClient, ApiError } from '../api-client'
import {
  contractSchema,
  createQuoteRequestSchema,
  initiatePaymentRequestSchema,
  paymentTransactionSchema,
  planSchema,
  quoteSchema,
  type Contract,
  type CreateQuoteRequest,
  type InitiatePaymentRequest,
  type PaymentTransaction,
  type Plan,
  type Quote,
} from '../contracts'

/**
 * The 5 typed calls the core quote to purchase loop needs (spec 0002).
 * Each parses its response through the matching Zod schema via apiClient
 * (spec 0001), so a malformed payload throws ApiValidationError instead
 * of silently reaching app code.
 */

export interface AvailablePlansRequest {
  countryOfDepartureId: string
  countryOfDestinationId: string
  dateOfDeparture: string
  dateOfReturn: string
  travelerDobs: string[]
  tripType: 'SINGLETRIP' | 'STUDENT' | 'SG'
}

export function getAvailablePlans(request: AvailablePlansRequest): Promise<Plan[]> {
  return apiClient.post('/travel/available-plans', z.array(planSchema), request)
}

/**
 * Thrown when the plan's selectionToken has expired or the itinerary no
 * longer matches it (spec 0002, AC-4). Distinct from a generic ApiError
 * so the caller can say "re-price and try again" instead of a generic
 * failure message.
 */
export class SelectionTokenExpiredError extends Error {
  constructor() {
    super('The selected plan is no longer valid; re-price and try again.')
    this.name = 'SelectionTokenExpiredError'
  }
}

export async function createQuote(request: CreateQuoteRequest): Promise<Quote> {
  createQuoteRequestSchema.parse(request)
  try {
    return await apiClient.post('/quotes', quoteSchema, request)
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new SelectionTokenExpiredError()
    }
    throw error
  }
}

export function initiatePayment(
  quoteId: string,
  request: InitiatePaymentRequest,
): Promise<PaymentTransaction> {
  initiatePaymentRequestSchema.parse(request)
  return apiClient.post(`/quotes/${quoteId}/payment`, paymentTransactionSchema, request)
}

export function getPaymentStatus(quoteId: string): Promise<PaymentTransaction> {
  return apiClient.get(`/quotes/${quoteId}/payment`, paymentTransactionSchema)
}

export function getContract(quoteId: string): Promise<Contract> {
  return apiClient.get(`/quotes/${quoteId}/contract`, contractSchema)
}
