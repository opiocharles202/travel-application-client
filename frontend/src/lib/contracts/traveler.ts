import { z } from 'zod'
import { moneySchema } from './money'

export const nextOfKinSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
})
export type NextOfKin = z.infer<typeof nextOfKinSchema>

export const genderSchema = z.enum(['male', 'female'])
export type Gender = z.infer<typeof genderSchema>

export const travelerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  otherName: z.string().nullable(),
  dob: z.string(),
  nationality: z.string(),
  passportNumber: z.string(),
  idNumber: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  postalAddress: z.string().nullable(),
  nextOfKin: nextOfKinSchema.nullable(),
  gender: genderSchema,
  passportExpiry: z.string(),
  cost: moneySchema,
})

export type Traveler = z.infer<typeof travelerSchema>

/**
 * A traveler as submitted when creating a quote: no id yet (the backend
 * assigns it), and no cost yet (the backend derives each traveler's share
 * of the group premium). Everything else is required up front.
 */
export const travelerInputSchema = travelerSchema.omit({ id: true, cost: true })
export type TravelerInput = z.infer<typeof travelerInputSchema>
