import { z } from 'zod'

export const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
  iso2: z.string().length(2),
  iso3: z.string().length(3),
})

export type Country = z.infer<typeof countrySchema>
