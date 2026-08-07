import { z } from 'zod'

/**
 * Every premium, levy, or payable amount in this app is a Money value, never
 * a bare number, so currency is never silently assumed (spec 0002).
 */
export const moneySchema = z.object({
  amount: z.number(),
  currency: z.string().length(3),
})

export type Money = z.infer<typeof moneySchema>
