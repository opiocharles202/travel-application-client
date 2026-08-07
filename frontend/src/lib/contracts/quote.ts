import { z } from 'zod'
import { countrySchema } from './country'
import { moneySchema } from './money'
import { travelerInputSchema, travelerSchema } from './traveler'

export const quoteStatusSchema = z.enum(['pending', 'paid', 'cancelled'])
export type QuoteStatus = z.infer<typeof quoteStatusSchema>

export const reasonForTravelSchema = z.enum(['leisure', 'business', 'study'])
export type ReasonForTravel = z.infer<typeof reasonForTravelSchema>

export const quoteSchema = z.object({
  id: z.string(),
  status: quoteStatusSchema,
  travelers: z.array(travelerSchema),
  planId: z.string(),
  premium: moneySchema,
  levy: moneySchema,
  amountPayable: moneySchema,
  dateOfDeparture: z.string(),
  dateOfReturn: z.string(),
  reasonForTravel: reasonForTravelSchema,
  countryOfDeparture: countrySchema,
  countryOfDestination: countrySchema,
  policyNumber: z.string().nullable(),
  createdAt: z.string(),
})

export type Quote = z.infer<typeof quoteSchema>

/** The request body for POST /quotes: what the frontend supplies to create one. */
export const createQuoteRequestSchema = z.object({
  planId: z.string(),
  selectionToken: z.string(),
  travelers: z.array(travelerInputSchema).min(1),
  reasonForTravel: reasonForTravelSchema,
  dateOfDeparture: z.string(),
  dateOfReturn: z.string(),
  countryOfDepartureId: z.string(),
  countryOfDestinationId: z.string(),
})

export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>
