import { z } from 'zod'
import { moneySchema } from './money'

/**
 * timedOut is distinct from failed (spec 0002, AC-5): the gateway never
 * resolved, versus the gateway explicitly declined the payment. The UI
 * needs to tell these apart to offer the right recovery action.
 */
export const paymentStatusSchema = z.enum(['initiated', 'pending', 'success', 'failed', 'timedOut'])
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const paymentTransactionSchema = z.object({
  id: z.string(),
  quoteId: z.string(),
  mobileNumber: z.string(),
  amount: moneySchema,
  status: paymentStatusSchema,
  gatewayRef: z.string().nullable(),
  initiatedAt: z.string(),
  updatedAt: z.string(),
})

export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>

export const initiatePaymentRequestSchema = z.object({
  mobileNumber: z.string().min(9),
})

export type InitiatePaymentRequest = z.infer<typeof initiatePaymentRequestSchema>
