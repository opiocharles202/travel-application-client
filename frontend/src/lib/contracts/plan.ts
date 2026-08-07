import { z } from 'zod'
import { moneySchema } from './money'

export const planZoneSchema = z.enum(['AFRICA_ASIA', 'EUROPE', 'WORLDWIDE', 'IMS'])
export type PlanZone = z.infer<typeof planZoneSchema>

export const addOnSchema = z.object({
  enabled: z.boolean(),
  premium: moneySchema,
})
export type AddOn = z.infer<typeof addOnSchema>

/**
 * selectionToken binds this exact priced plan to its itinerary context
 * (spec 0002; mirrors the HMAC-signed token described in
 * REVERSE_ENGINEERING.pdf section 4). The frontend treats it as opaque:
 * it is sent back verbatim on quote creation and never inspected or
 * regenerated client side.
 */
export const planSchema = z.object({
  id: z.string(),
  planCode: z.string(),
  label: z.string(),
  zone: planZoneSchema,
  currency: z.string().length(3),
  basePremium: moneySchema,
  levy: moneySchema,
  addOns: z.object({
    covid: addOnSchema,
    winterSport: addOnSchema,
    golf: addOnSchema,
  }),
  totalPayable: moneySchema,
  selectionToken: z.string(),
  selectionTokenExpiresAt: z.string(),
})

export type Plan = z.infer<typeof planSchema>
