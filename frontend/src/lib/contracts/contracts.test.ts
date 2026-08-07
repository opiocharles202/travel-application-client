import { describe, expect, it } from 'vitest'
import { contractSchema } from './contract'
import { countrySchema } from './country'
import { moneySchema } from './money'
import { paymentTransactionSchema } from './payment'
import { planSchema } from './plan'
import { quoteSchema } from './quote'
import { travelerSchema } from './traveler'

const validMoney = { amount: 188100, currency: 'UGX' }
const validCountry = { id: 'c1', name: 'Uganda', iso2: 'UG', iso3: 'UGA' }

const validTraveler = {
  id: 't1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  otherName: null,
  dob: '1990-01-01',
  nationality: 'Ugandan',
  passportNumber: 'A1234567',
  idNumber: null,
  phone: null,
  email: null,
  postalAddress: null,
  nextOfKin: null,
  gender: 'female',
  passportExpiry: '2030-01-01',
  cost: validMoney,
}

const validPlan = {
  id: 'p1',
  planCode: 'WORLDWIDE_SILVER',
  label: 'Worldwide Silver',
  zone: 'WORLDWIDE',
  currency: 'UGX',
  basePremium: validMoney,
  levy: { amount: 8100, currency: 'UGX' },
  addOns: {
    covid: { enabled: false, premium: validMoney },
    winterSport: { enabled: false, premium: validMoney },
    golf: { enabled: false, premium: validMoney },
  },
  totalPayable: validMoney,
  selectionToken: 'token-1',
  selectionTokenExpiresAt: '2026-08-07T12:00:00.000Z',
}

const validQuote = {
  id: 'q1',
  status: 'pending',
  travelers: [validTraveler],
  planId: 'p1',
  premium: validMoney,
  levy: { amount: 8100, currency: 'UGX' },
  amountPayable: validMoney,
  dateOfDeparture: '2026-09-01',
  dateOfReturn: '2026-09-10',
  reasonForTravel: 'leisure',
  countryOfDeparture: validCountry,
  countryOfDestination: validCountry,
  policyNumber: null,
  createdAt: '2026-08-07T12:00:00.000Z',
}

const validPayment = {
  id: 'pay1',
  quoteId: 'q1',
  mobileNumber: '256700000000',
  amount: validMoney,
  status: 'pending',
  gatewayRef: null,
  initiatedAt: '2026-08-07T12:00:00.000Z',
  updatedAt: '2026-08-07T12:00:00.000Z',
}

const validContract = {
  id: 'con1',
  quoteId: 'q1',
  status: 'issued',
  contractCode: 'ILT1-q1',
  pdfUrl: 'https://mock.local/contracts/q1.pdf',
  qrValidationUrl: 'https://mock.local/certificate-validator/q1',
  issuedAt: '2026-08-07T12:00:00.000Z',
}

describe('contracts (spec 0002, AC-1, AC-8)', () => {
  it('accepts a well-formed Money value', () => {
    expect(moneySchema.parse(validMoney)).toEqual(validMoney)
  })

  it('rejects a Money value with a malformed currency code', () => {
    expect(() => moneySchema.parse({ amount: 100, currency: 'US' })).toThrow()
  })

  it('accepts a well-formed Country value', () => {
    expect(countrySchema.parse(validCountry)).toEqual(validCountry)
  })

  it('rejects a Country value missing iso3', () => {
    expect(() => countrySchema.parse({ id: 'c1', name: 'Uganda', iso2: 'UG' })).toThrow()
  })

  it('accepts a well-formed Traveler', () => {
    expect(travelerSchema.parse(validTraveler)).toEqual(validTraveler)
  })

  it('rejects a Traveler with an invalid gender value', () => {
    expect(() => travelerSchema.parse({ ...validTraveler, gender: 'unspecified' })).toThrow()
  })

  it('accepts a well-formed Plan', () => {
    expect(planSchema.parse(validPlan)).toEqual(validPlan)
  })

  it('rejects a Plan with an invalid zone', () => {
    expect(() => planSchema.parse({ ...validPlan, zone: 'MARS' })).toThrow()
  })

  it('accepts a well-formed Quote', () => {
    expect(quoteSchema.parse(validQuote)).toEqual(validQuote)
  })

  it('rejects a Quote with an invalid status', () => {
    expect(() => quoteSchema.parse({ ...validQuote, status: 'archived' })).toThrow()
  })

  it('accepts a well-formed PaymentTransaction', () => {
    expect(paymentTransactionSchema.parse(validPayment)).toEqual(validPayment)
  })

  it('rejects a PaymentTransaction with an invalid status, never coerces it', () => {
    expect(() => paymentTransactionSchema.parse({ ...validPayment, status: 'unknown' })).toThrow()
  })

  it('accepts a well-formed Contract', () => {
    expect(contractSchema.parse(validContract)).toEqual(validContract)
  })

  it('rejects a Contract with an invalid status', () => {
    expect(() => contractSchema.parse({ ...validContract, status: 'archived' })).toThrow()
  })
})
