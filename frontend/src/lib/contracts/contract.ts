import { z } from 'zod'

/**
 * Mirrors the legacy contract_status state machine that
 * REVERSE_ENGINEERING.pdf (section 4, section 5.2) calls a good pattern
 * to keep. issuanceFailed is distinct (spec 0002, AC-6): payment can
 * succeed while contract issuance still fails, and the UI must never
 * imply the customer lost their money when that happens.
 */
export const contractStatusSchema = z.enum(['pending', 'issuing', 'issued', 'issuanceFailed'])
export type ContractStatus = z.infer<typeof contractStatusSchema>

export const contractSchema = z.object({
  id: z.string(),
  quoteId: z.string(),
  status: contractStatusSchema,
  contractCode: z.string().nullable(),
  pdfUrl: z.string().nullable(),
  qrValidationUrl: z.string().nullable(),
  issuedAt: z.string().nullable(),
})

export type Contract = z.infer<typeof contractSchema>
