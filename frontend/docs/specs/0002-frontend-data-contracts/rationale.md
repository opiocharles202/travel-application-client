# 0002. Frontend data contracts: rationale

## Context

The frontend and backend for this rebuild are being built by two different developers, and the NestJS backend does not exist yet (`frontend/docs/REVERSE_ENGINEERING.pdf`, section 12 names the target modules but nothing is implemented). The frontend cannot wait for the backend to exist before building the core quote to purchase loop (scope feature 6), the next slice after this one. This spec has to do two things at once: give the frontend a typed, validated contract for every entity and endpoint the core loop needs, and give the frontend a way to actually run and be demoed against those contracts before a real API answers them.

The reverse engineering document documents the legacy PHP system's actual routes and database columns (sections 5 and 6), and separately recommends a target NestJS architecture (section 12) and React frontend architecture (section 13) for the rebuild. Neither is a live, agreed API contract; both are planning documents. The engineer chose, when asked, to model an intentionally clean contract now rather than pause and wait to sync with the backend developer first, accepting the risk that the real backend may end up shaped differently and this spec may need revision later, in exchange for not blocking frontend progress.

The entity scope is deliberately narrow: only what the core quote to purchase loop (scope feature 6) and the payment feature (scope feature 7) need. Admin and broker entities (corporate accounts, staff, agent production data) are real, documented needs, but they belong to features 10 slices away that have not been architected yet, and modeling them now would be speculative typing against requirements not yet walked in their own staged conversation.

## Options considered

### Option 1: Model an ideal contract now, let the backend converge to it

Design clean, well-typed contracts from the reverse engineering document's data model and the recommended NestJS module list, treating this as the target the backend should build to.

**Pros**:

- Unblocks the core loop feature immediately; no dependency on the other developer's schedule.
- A clean contract, not constrained by the legacy schema's known problems (denormalized country strings, inconsistent status enums, no real foreign keys), gives the backend developer a concrete, well-reasoned target instead of starting from nothing.

**Cons**:

- Risk that the real backend ends up shaped differently (different field names, different status values, a different pagination convention), which means revising this spec and the frontend code that depends on it.

### Option 2: Wait and sync with the backend developer first

Pause this spec until payload shapes are confirmed with the other developer, so contracts are written once against agreed types.

**Pros**:

- Zero risk of building against a contract that turns out wrong.

**Cons**:

- Blocks all frontend progress on the other developer's availability and pace, which the engineer explicitly wants to avoid; the scope's own sequencing rule already requires this feature to close before the core loop can start, so any delay here delays everything after it.

## Rationale

The engineer chose Option 1 directly when asked (basis: the engineer's own answer during the staged design conversation). This is consistent with the project's Tracer Bullet build approach (`docs/scope/scope.md`), whose entire premise is proving the pipe works end to end with a real, working thread rather than waiting for every dependency to be settled first. A mocked but schema-honest contract, enforced by the same Zod validation the real backend's responses will later be parsed through (spec 0001's `apiClient`), gives the core loop something real to build and demo against now, and the moment a live backend responds differently, `apiClient`'s existing `ApiValidationError` path (spec 0001) surfaces the mismatch immediately rather than silently accepting bad data.

## References

**Project sources** (verifiable, in this repo):

- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 4 (the quote, price, pay, issue workflow this contract layer types)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 5.2 (savedquotations, travelinfo, uganda_paygate_transactions, travel_contract_issuance, travel_countries table shapes)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 6 (TravelApiController named as the one clean, modern controller to mirror)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 12 (recommended NestJS module boundaries: QuotationModule, PaymentModule, ContractModule, GeoModule)
- `frontend/docs/scope/scope.md`, the Tracer Bullet build approach and the sequencing rule
- `frontend/docs/specs/0001-stack-and-architecture/`, the Zod-validated `apiClient` pattern this spec's contracts plug into

**Practices & standards**:

- Schema validated input at every trust boundary, applied here via Zod (continuing spec 0001's baseline)
- Network-level request mocking (intercepting the real fetch call) over hand-written fake clients, so mocked and production code paths are identical

**Links** (web verified during the Stage (c) landscape check):

- MSW (Mock Service Worker): https://mswjs.io/docs/
- MSW Node.js/Vitest integration: https://mswjs.io/docs/integrations/node/
- MSW on npm: https://www.npmjs.com/package/msw
