# 0002. Frontend data contracts for the core quote to purchase loop

**Date**: 2026-08-07
**Status**: Accepted

## Summary

This defines the typed, validated shape of every entity and API call the frontend's core quote to purchase loop needs: a quote, its travelers, an insurance plan, a payment attempt, and the issued contract. Because the real backend does not exist yet, this spec also decides how the app runs and can be demoed fully against a mocked network layer that honors the exact same contracts a real backend will later be checked against. Getting this right now means the next feature (the actual quote wizard) has real, validated data to build against instead of guessing, and the moment a real backend exists, any mismatch is caught immediately instead of silently accepted.

## Context

See `rationale.md` for the full context, options considered, and references.

## Requirements

**User stories**:

- As a frontend engineer, I want typed and runtime validated contracts for every entity and endpoint the core loop touches, so that I can build the quote wizard against a real, checked shape instead of an assumed one.
- As a frontend engineer, I want the app to run fully without a live backend, so that the core loop feature (and every feature after it, until the real backend exists) is not blocked on the other developer's schedule.
- As a future maintainer, I want a schema mismatch between the mocked contract and a real backend response to fail loudly, not silently, so that a wrong assumption is caught at the moment it's introduced.

**Acceptance criteria**:

- **AC-1**: Every entity (Quote, Traveler, Plan, PaymentTransaction, Contract, Country) has a Zod schema exported from a single contracts module, and a TypeScript type inferred from it (never hand duplicated).
- **AC-2**: Every one of the 5 endpoints (available plans, create quote, initiate payment, poll payment status, get contract) has a request schema (where it takes a body) and a response schema, and calling it through `apiClient` (spec 0001) returns a value typed by that response schema or throws `ApiValidationError`.
- **AC-3**: With `VITE_API_BASE_URL` pointed at nothing real, running the app in mock mode serves realistic responses for all 5 endpoints from MSW, using the same Zod schemas to generate them, so a mocked response can never itself violate the contract.
- **AC-4**: Creating a quote with an expired or invalid plan `selectionToken` returns a distinct, typed error the caller can branch on (not the generic `ApiError`), so the UI can say "re-price and try again."
- **AC-5**: Polling payment status surfaces a distinct `timedOut` outcome once a payment has been `pending` past a defined threshold, not an indefinite `pending`.
- **AC-6**: Fetching a contract for a quote whose payment succeeded but whose contract issuance failed returns a distinct `issuanceFailed` status, never a generic error and never a false `issued`.
- **AC-7**: The `GET /travel/available-plans` equivalent works with no authentication; every other endpoint (create quote, initiate payment, poll status, get contract) requires the caller to own the quote, enforced in the mock layer the same shape a real backend enforcement would take, so the frontend never assumes an endpoint is safe to call without ownership context.
- **AC-8**: Unit tests exist for every schema's parse success and parse failure path (a malformed payload is rejected, not coerced), and for the ownership and public/private split across the 5 endpoints in mock mode.

## Options considered

See `rationale.md`.

## Decision

**Chosen option**: Model an ideal contract now, based on the reverse engineering document's data model and the recommended NestJS module boundaries, and let the real backend converge to it. Mock the network layer with MSW so the app runs and can be demoed fully before the real backend exists.

The frontend gets one contracts module (Zod schemas plus inferred types) covering Quote, Traveler, Plan, PaymentTransaction, Contract, and Country, plus 5 typed API functions built on spec 0001's `apiClient`, plus an MSW-backed mock server that serves schema-honest responses for all 5 endpoints in development and in tests.

## Feature design

**Data model sketch**:

| Entity | Key fields | Notes |
|---|---|---|
| **Quote** | `id: string`, `status: 'pending' \| 'paid' \| 'cancelled'`, `travelers: Traveler[]`, `planId: string`, `premium: Money`, `levy: Money`, `amountPayable: Money`, `dateOfDeparture: string (ISO date)`, `dateOfReturn: string (ISO date)`, `reasonForTravel: 'leisure' \| 'business' \| 'study'`, `countryOfDeparture: Country`, `countryOfDestination: Country`, `policyNumber: string \| null`, `createdAt: string (ISO datetime)` | 1 to many Travelers; many to one Plan; drops the legacy soft delete status and admin booking flag, both out of scope for this pass |
| **Traveler** | `id: string`, `firstName: string`, `lastName: string`, `otherName: string \| null`, `dob: string (ISO date)`, `nationality: string`, `passportNumber: string`, `idNumber: string \| null`, `phone: string \| null`, `email: string \| null`, `postalAddress: string \| null`, `nextOfKin: { name: string, phone: string, relationship: string } \| null`, `gender: 'male' \| 'female'`, `passportExpiry: string (ISO date)`, `cost: Money` | belongs to exactly one Quote |
| **Plan** | `id: string`, `planCode: string`, `label: string`, `zone: 'AFRICA_ASIA' \| 'EUROPE' \| 'WORLDWIDE' \| 'IMS'`, `currency: string (ISO 4217)`, `basePremium: Money`, `levy: Money`, `addOns: { covid: AddOn, winterSport: AddOn, golf: AddOn }`, `totalPayable: Money`, `selectionToken: string`, `selectionTokenExpiresAt: string (ISO datetime)` | `AddOn = { enabled: boolean, premium: Money }`; `selectionToken` binds this exact priced plan to its itinerary context, mirrors the HMAC-signed token the reverse engineering document describes (section 4) |
| **PaymentTransaction** | `id: string`, `quoteId: string`, `mobileNumber: string`, `amount: Money`, `status: 'initiated' \| 'pending' \| 'success' \| 'failed' \| 'timedOut'`, `gatewayRef: string \| null`, `initiatedAt: string (ISO datetime)`, `updatedAt: string (ISO datetime)` | 1 to 1 with Quote (a quote has at most one active payment transaction in this pass); `timedOut` is distinct from `failed` (AC-5) |
| **Contract** | `id: string`, `quoteId: string`, `status: 'pending' \| 'issuing' \| 'issued' \| 'issuanceFailed'`, `contractCode: string \| null`, `pdfUrl: string \| null`, `qrValidationUrl: string \| null`, `issuedAt: string (ISO datetime) \| null` | 1 to 1 with Quote; mirrors the legacy `contract_status` state machine the reverse engineering document calls a good pattern to keep (section 4, section 5.2) |
| **Country** | `id: string`, `name: string`, `iso2: string`, `iso3: string` | referenced by Quote (departure and destination); fuzzy alias resolution is a backend concern, the frontend only sends/receives the resolved reference |
| **Money** (shared value type, not a standalone entity) | `{ amount: number, currency: string (ISO 4217) }` | used everywhere a premium, levy, or payable amount appears, so currency is never silently assumed |

**State transitions**:

- Quote: `pending` → `paid` → (a Contract is created) · `pending` → `cancelled`
- PaymentTransaction: `initiated` → `pending` → `success` | `failed` | `timedOut`
- Contract: `pending` → `issuing` → `issued` | `issuanceFailed` (retry from `issuanceFailed` back to `issuing` is a backend concern; the frontend only observes and displays the state)

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/travel/available-plans` | POST | destinations, dates, traveler DOBs, tripType | `Plan[]` | public | 422 invalid itinerary |
| `/quotes` | POST | `planId`, `selectionToken`, `travelers[]`, `reasonForTravel`, dates, countries | `Quote` | owner (the creating client) | 409 selection token expired/invalid (AC-4), 422 invalid traveler data |
| `/quotes/:id/payment` | POST | `mobileNumber` | `PaymentTransaction` | owner of `:id` | 403 not the quote's owner, 422 invalid mobile number |
| `/quotes/:id/payment` | GET | (path only) | `PaymentTransaction` | owner of `:id` | 403 not the quote's owner, 404 no payment yet initiated |
| `/quotes/:id/contract` | GET | (path only) | `Contract` | owner of `:id` | 403 not the quote's owner, 404 payment not yet successful |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Get available plans | `Plan.selectionToken` | generated by the mock/backend at pricing time, opaque to the frontend, sent back verbatim on quote creation |
| Get available plans | `Plan.totalPayable` | derived from `basePremium + levy + enabled addOns`, computed server side (mock or real), never recomputed client side (mirrors the reverse engineering document's own "do not trust a browser supplied premium" rule, section 4) |
| Create quote | `Quote.id`, `Quote.policyNumber` | generated server side (mock or real) on creation; `policyNumber` is `null` until payment succeeds |
| Create quote | rejection when `selectionToken` expired | the mock/backend compares `selectionTokenExpiresAt` against the current time at the moment of the create call, not the frontend |
| Poll payment status | `PaymentTransaction.status = 'timedOut'` | the mock/backend flips `pending` to `timedOut` once `updatedAt` exceeds a fixed threshold (2 minutes in the mock, configurable); the frontend never computes this itself, it only observes the returned status |
| Get contract | `Contract.status = 'issuanceFailed'` | set by the mock/backend when a payment's linked contract issuance attempt did not succeed; the frontend only ever reads this, never infers it from payment status alone |

**Key invariants**:

- `Quote.amountPayable` always equals `Plan.totalPayable` at the moment the quote was created (a quote is a snapshot of the plan's price, not a live reference).
- A `PaymentTransaction` only exists once a `Quote` exists (`PaymentTransaction.quoteId` always references a real quote).
- A `Contract` only reaches `issued` after its linked `PaymentTransaction.status` is `success`.
- Every `Money` value carries an explicit `currency`; a bare number is never treated as an amount anywhere in the contracts module.

**Security model**:

- `POST /travel/available-plans` is public; no traveler PII is required to get a price.
- Every other endpoint requires the caller to own the referenced quote (the authenticated client's id matches the quote's owner), enforced in the MSW mock handlers the same shape a real backend check would take (AC-7), directly addressing the legacy system's documented gap where most endpoints checked token presence but not ownership (`frontend/docs/REVERSE_ENGINEERING.pdf`, section 3.4).
- No compliance scope beyond the project's existing security baseline (spec 0001): traveler data (passport numbers, DOB) is PII and flows only through Zod-validated, owner-scoped endpoints, never logged in full.

**Configuration required**:

- `VITE_ENABLE_MOCKS`: `'true' | 'false'`, controls whether MSW intercepts network calls. Defaults to `'true'` in local development until a real `VITE_API_BASE_URL` backend exists; must be `'false'` in any environment with a real backend, so mocks never silently mask a real integration failure.

**Critical test scenarios**:

- Happy path: request available plans, create a quote from a returned plan, initiate payment, poll until `success`, fetch the issued contract, verifies **AC-1, AC-2, AC-3**.
- Failure case: create a quote with an expired `selectionToken`, verifies **AC-4**.
- Failure case: poll a payment that never resolves past the timeout threshold, verifies **AC-5**.
- Failure case: fetch a contract whose issuance failed after a successful payment, verifies **AC-6**.
- Auth/permission: call any owner-scoped endpoint for a quote belonging to a different client, expect a 403, never the quote's data, verifies **AC-7**.
- Validation: parse a deliberately malformed response through each schema, expect `ApiValidationError`, never a silently coerced value, verifies **AC-1, AC-8**.

## Build plan

1. Create the shared `Money` type and the `Country` schema in `src/lib/contracts/`, satisfies **AC-1**.
2. Create the `Plan` schema (including `selectionToken` and its expiry), satisfies **AC-1**.
3. Create the `Traveler` and `Quote` schemas, satisfies **AC-1**.
4. Create the `PaymentTransaction` and `Contract` schemas, including their status enums, satisfies **AC-1**.
5. Write the 5 typed API functions on top of `apiClient` (spec 0001), one per endpoint, each parsing its response through the matching schema, satisfies **AC-2**.
6. Install MSW; write mock handlers for all 5 endpoints that generate responses validated against the same schemas before returning them, satisfies **AC-3**.
7. Wire the expired/invalid `selectionToken` rejection into the create quote mock handler, satisfies **AC-4**.
8. Wire the payment timeout transition into the payment status mock handler, satisfies **AC-5**.
9. Wire the issuance failure state into the contract mock handler, satisfies **AC-6**.
10. Wire ownership checks (403 on mismatch) into every owner scoped mock handler; leave available plans public, satisfies **AC-7**.
11. Wire `VITE_ENABLE_MOCKS` to start/stop the MSW server at app boot (browser) and in the Vitest setup file (test), satisfies **AC-3**.
12. Write unit tests for every schema (valid input parses, malformed input throws) and for the mock layer's auth/ownership and timeout/failure behavior, satisfies **AC-8**.

All 12 tasks built. Code in `src/lib/contracts/`, `src/lib/api/travel.ts`, `src/mocks/`. 31/31 tests passing (`npm run test:unit`), including a test proving `ApiValidationError` throws through the real network path (not just a direct schema parse) when a response violates its contract; typecheck, lint, and build all clean. Verified live in a real browser against a running dev server (`/check verify`): MSW intercepted all 5 calls end to end.

## Consequences

**Positive**:

- The core loop feature (scope feature 6) has a real, typed, runtime validated contract to build against immediately, with no dependency on the backend developer's timeline.
- The exact same Zod schemas validate both the mock responses and, later, real backend responses, so a mismatch is caught by the existing `ApiValidationError` path (spec 0001) the first time it happens, not discovered later as a silent bug.
- Ownership enforcement is modeled from day one in the mock layer, so the frontend never assumes an endpoint is safe to call without ownership context, directly avoiding the legacy IDOR pattern.

**Negative / tradeoffs**:

- These contracts are this project's best guess at the backend's eventual shape, not an agreed interface; if the real backend lands differently, this spec, the schemas, and the features built on them need revision. This is the accepted tradeoff of not waiting to sync with the backend developer first.
- MSW adds a dependency and a maintenance surface (mock handlers) that must be kept in sync with the schemas as they evolve; a schema change without a matching handler update produces a broken mock, not a broken production call, so it needs its own test discipline (AC-8) to catch.

**Neutral**:

- Admin and broker entities are explicitly out of scope for this pass and will get their own contracts when those features are architected; this is intentional narrowing, not an oversight.

## Follow-up

- [ ] Once the backend developer has a real API surface, diff it against this spec's `## Feature design` API surface table and reconcile; expect at least field naming differences given this was modeled independently.
- [ ] The `VITE_ENABLE_MOCKS` flag must default to `'false'` (or be removed entirely) before any environment points at a real backend; add this to the eventual deployment checklist so mocks can never silently mask a real integration failure in a shipped environment.
- [ ] The payment timeout threshold (2 minutes in the mock) is a guess; confirm the real gateway's actual behavior once integrated and adjust, or move the threshold to a named constant the backend can inform.

## Rationale

Reasoning, options considered, and references: see `rationale.md`.
