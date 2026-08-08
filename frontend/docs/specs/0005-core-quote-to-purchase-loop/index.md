# 0005. Core quote to purchase loop (the public 5 step wizard)

**Date**: 2026-08-08
**Status**: Proposed

## Summary

This builds the actual public quote wizard: five steps a customer walks through to price a trip, pick a plan, give their contact details, list who's traveling, and land on a confirmation screen that has created a real quotation. It is the first screen in this project a real customer would use. Payment and full account creation are deliberately not part of this pass (they come in the next two slices); this wizard proves the whole pipe works end to end with a guest checkout, using the data contracts and design system every earlier feature already built.

## Context

See `rationale.md` for the full context and options considered.

## Requirements

**User stories**:

- As a traveler, I want to enter my trip details and see priced insurance plans, so that I can pick one that fits my trip and budget.
- As a traveler without an account, I want to check out as a guest, so that I don't have to create an account just to get a quote.
- As a traveler with more than one person on the trip, I want to enter each traveler's details, so that everyone is covered by the policy.
- As a traveler, I want a clear confirmation once my quote is created, so that I know it worked and what happens next.

**Acceptance criteria**:

- **AC-1**: Step 1 (Itinerary) collects destination, departure country, departure/return dates, number of travelers (each rendering its own DOB field), trip type, and reason for travel; submitting it calls `getAvailablePlans` (spec 0002) and advances to step 2 only on success.
- **AC-2**: Step 2 (Quotation) shows every plan `getAvailablePlans` returned as a card: plan label, zone, base premium, and the three add-on toggles (covid, winter sport, golf), each toggle visibly changing the displayed total to match `Plan.totalPayable` semantics. Selecting a plan and its add-ons advances to step 3.
- **AC-3**: Step 3 (Billing) collects a guest checkout contact: full name, email, and phone number. No login or signup form is presented (no auth mechanism exists yet); submitting valid contact details advances to step 4.
- **AC-4**: Step 4 (Travelers) renders one traveler detail block per the traveler count from step 1, each collecting the required `Traveler` fields (spec 0002: first/last name, DOB pre-filled and locked from step 1, nationality, passport number, gender, passport expiry), with next of kin, postal address, and ID number present but optional. Submitting valid details for every traveler advances to step 5.
- **AC-5**: Step 5 (Confirmation) calls `createQuote` (spec 0002) with the accumulated data from steps 1 to 4, shows a loading state while it's in flight, and on success shows the created quotation's id, a summary of what was booked, and next steps copy (payment comes later, not in this pass). On a `SelectionTokenExpiredError` (spec 0002, AC-4), the screen shows a clear "your quote expired, please re-price" message and a way back to step 1, not a generic error.
- **AC-6**: A user can navigate backward to any already completed step via the `Stepper` (spec 0003) without losing the data they already entered on other steps.
- **AC-7**: If a user changes the itinerary (step 1) after already selecting a plan (step 2), the plan selection is cleared and the user must re-select once new plans are fetched; a stale `selectionToken` is never carried forward into `createQuote`.
- **AC-8**: Every step's fields are validated with Zod before advancing; an invalid field shows an inline error per the `Input`/`Select` components' existing error state (spec 0003, AC-7), and the step cannot be advanced past while a required field is invalid or empty.
- **AC-9**: The whole wizard renders inside `<AppShell variant="public">` (spec 0004) and uses only spec 0003's design tokens and base components; no new hardcoded color, spacing, or ad hoc form control is introduced.
- **AC-10**: The wizard is keyboard operable end to end: every field, toggle, and the stepper's reachable steps can be operated via keyboard alone, matching the accessibility bar already set (spec 0003).

## Options considered

See `rationale.md`.

## Decision

**Chosen option**: A single React Hook Form instance spans all 5 steps (Zod schema validated per step before advancing), a guest checkout billing step with no auth UI, and full plan detail including add-ons at the quotation step.

Step components are presentational; a parent `QuoteWizard` component owns the form instance, the current step index, and the TanStack Query calls to `getAvailablePlans` and `createQuote` (spec 0002's `src/lib/api/travel.ts`).

## Feature design

**Data model sketch**: no new persisted entities; this feature consumes spec 0002's `Quote`, `Traveler`, `Plan`, `Country` contracts directly. The wizard's own in-memory form state shape:

```
WizardFormValues = {
  // step 1
  countryOfDepartureId: string
  countryOfDestinationId: string
  dateOfDeparture: string
  dateOfReturn: string
  travelerCount: number
  travelerDobs: string[]
  tripType: 'SINGLETRIP' | 'STUDENT' | 'SG'
  reasonForTravel: 'leisure' | 'business' | 'study'
  // step 2 (populated after a plan is selected)
  selectedPlan: Plan | null
  addOns: { covid: boolean, winterSport: boolean, golf: boolean }
  // step 3
  billingName: string
  billingEmail: string
  billingPhone: string
  // step 4
  travelers: TravelerInput[]  // spec 0002, one entry per travelerCount
}
```

**State transitions**: the wizard's step index: `1 -> 2 -> 3 -> 4 -> 5`, with backward navigation to any already completed step (AC-6) and a forced `2 -> null` reset of `selectedPlan`/`addOns` whenever step 1's itinerary fields change after a plan was already selected (AC-7).

**API surface**: no new endpoints; this feature calls spec 0002's existing `getAvailablePlans` (step 1 submit) and `createQuote` (step 5, confirmation).

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Step 2 plan cards | `totalPayable` per plan/add-on combination | `Plan.totalPayable` and each `AddOn.premium` from the `getAvailablePlans` response (spec 0002); never recomputed client side, matching spec 0002's own value sourcing rule that the backend/mock is the price authority |
| Step 4 traveler DOB fields | pre-filled DOB per traveler | copied from step 1's `travelerDobs[i]`, locked (not re-editable) at step 4, so the itinerary and traveler steps can never disagree on a traveler's age |
| Step 5 confirmation | the created quote's id and policy summary | the `Quote` object `createQuote`'s response resolves to (spec 0002); never assembled from the form's own local state, so what's displayed is what the mock/backend actually recorded |

**Key invariants**:

- `createQuote`'s `travelers[].dob` always matches the DOB entered for that traveler in step 1; the wizard never lets these values diverge.
- The wizard never calls `createQuote` with a `selectionToken` from a plan fetched against a different itinerary than the one currently in step 1's form state (AC-7).

**Security model**: no new auth surface (guest checkout only, no session created). Every field a customer enters is validated client side with Zod before submission and, per spec 0002's existing `apiClient`, validated again on the response side; no traveler PII is logged.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: complete all 5 steps with valid data for 2 travelers, confirm the wizard reaches the confirmation screen with a real quote id, verifies **AC-1** through **AC-6**.
- Failure case: submit step 1 with an empty required field, confirm the step does not advance and an inline error appears, verifies **AC-8**.
- Failure case: select a plan, go back to step 1, change the destination, confirm the plan selection is cleared and step 2 requires re-selecting, verifies **AC-7**.
- Failure case: force `createQuote` to reject with `SelectionTokenExpiredError` (via the MSW mock, spec 0002), confirm the confirmation step shows the re-price message, not a generic error, verifies **AC-5**.
- Accessibility: tab through every field across all 5 steps and confirm each is reachable with a visible focus indicator, verifies **AC-10**.

## Build plan

Ordered per the Tracer Bullet approach: stand up the thin end to end thread (a minimal version of every step, wired to the real contracts) before thickening any one step's detail.

1. Build the `QuoteWizard` shell: the `Stepper` (spec 0003) wired to a step index, the single React Hook Form instance, and routing/rendering for all 5 step placeholders inside `<AppShell variant="public">`, satisfies **AC-6, AC-9**.
2. Build step 1 (Itinerary) with its Zod schema and real fields, wired to call `getAvailablePlans` on submit, satisfies **AC-1, AC-8**.
3. Build step 2 (Quotation): render the real plan cards from the step 1 response, including add-on toggles updating the displayed total, satisfies **AC-2**.
4. Build step 3 (Billing): guest checkout fields only, satisfies **AC-3, AC-8**.
5. Build step 4 (Travelers): dynamic per-traveler field blocks (React Hook Form `useFieldArray`) sized to step 1's traveler count, DOB pre-filled and locked, satisfies **AC-4, AC-8**.
6. Build step 5 (Confirmation): call `createQuote` on entry, loading/success/error states, including the distinct expired-token message, satisfies **AC-5**.
7. Wire the itinerary-change-clears-plan-selection behavior (AC-7) and confirm backward navigation preserves already entered data (AC-6).
8. Verify keyboard operability across all 5 steps, satisfies **AC-10**.
9. Write tests: per-step validation, the happy path end to end, the plan-selection-clearing edge case, and the expired-token confirmation state.

## Consequences

**Positive**:

- This is the first feature that proves the entire stack (contracts, mocks, design system, shell, forms) genuinely works together end to end on a real user flow, not in isolation.
- Because the billing step is guest checkout only, no throwaway auth UI needs to be discarded when scope feature 8 designs real account creation.

**Negative / tradeoffs**:

- No real payment happens in this pass; a completed quote sits in `pending` status with no way to pay yet (Slice 2 adds that). The confirmation screen's "next steps" copy has to be honest about this rather than implying payment is available.
- A single large form instance across 5 steps means step components are not fully independent; a change to the shared form shape (`WizardFormValues`) can ripple across multiple step files.

**Neutral**:

- The traveler count control (how many travelers) lives in step 1, which means step 4's field array size is fixed by the time step 4 renders; changing traveler count requires going back to step 1, not an "add traveler" button on step 4 itself. This is a deliberate simplicity choice for this pass, not flagged as a gap since spec 0002's own data model has no partial-traveler-count concept.

## Follow-up

- [ ] Slice 2 (mobile-money payment, scope feature 7) picks up immediately after this wizard's confirmation screen; its own spec should decide whether payment is a 6th wizard step or a separate screen reached from the confirmation.
- [ ] Slice 3 (client account auth, scope feature 8) should decide whether the billing step gains a "sign in" option alongside guest checkout, or whether authenticated users skip billing entirely because their contact details are already known.

## Rationale

Reasoning and options considered: see `rationale.md`.
