# Scope: Uganda Paygate Frontend Rebuild

React frontend for ICEA LION's Uganda travel-insurance platform: a public quote-and-buy site, an admin back office, and a broker portal. This repo owns the frontend only; a separate developer owns the NestJS backend (`frontend/docs/REVERSE_ENGINEERING.pdf`, §12) against the API surface this scope builds to (§6, §13).

**Build approach:** Tracer Bullet (prove the whole pipe works end to end with one thin real thread before thickening any layer).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`. No separate model review by default).

**Sequencing (hard rule, not a suggestion):** work proceeds one feature at a time, in listed order. A feature must be built and verified (`/check verify`, `/test` per its Beta tier) before the next feature's `/architect` starts. This overrides the usual "every box is a suggestion" framing below for ordering specifically: do not open a second feature's design while an earlier one is still in progress. Exception: independent Foundation features (1 to 5) may be designed in sequence but their execution boxes can overlap only when explicitly agreed feature by feature; default is still strictly sequential.

**Security baseline (applies to every feature, set once so it's never re-litigated per feature):** dependency audit wired into CI (`npm audit` and Dependabot or Renovate), strict TypeScript (`strict: true`, no implicit any), schema validated input at every boundary (Zod or equivalent) even against mocked/future backend data, no `dangerouslySetInnerHTML` without sanitization, a Content-Security-Policy from the app shell outward, secrets only via env vars and never committed, and a security-aware lint ruleset (e.g. `eslint-plugin-security`, React's `eslint-plugin-react-hooks` strict mode). Every new package is checked for maintenance activity and known CVEs (`npm audit`, socket.dev, or equivalent) before it's added, not after. `/architect stack & architecture` (Feature 1) is where this baseline gets translated into concrete package choices and config; `/audit` then captures it into `AGENTS.md` so every later feature inherits it automatically.

_You are in charge. Every box below is a **suggestion**, not a gate: run any, skip any, and mark a feature `done` when you decide it is (sequencing above is the one exception). The one thing it asks is that a load bearing decision be written down (a spec), not that any check be run._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Frontend data contracts (API types & mocking) | Foundation | done |
| 4 | Design system & UI foundation | Foundation | in-progress |
| 5 | App shell & role-based routing | Foundation | planned |
| 6 | Core quote-to-purchase loop (client) | Slice 1 | planned |
| 7 | Mobile-money payment & status polling | Slice 2 | planned |
| 8 | Client account: signup, login, password reset | Slice 3 | planned |
| 9 | Client purchases history & policy detail | Slice 4 | planned |
| 10 | Certificate / embassy-letter public validator | Slice 5 | planned |
| 11 | Admin: auth, shell, and role-filtered navigation | Slice 6 | planned |
| 12 | Admin: dashboard KPIs | Slice 7 | planned |
| 13 | Generic admin data table / CRUD component | Slice 8 | planned |
| 14 | Admin: quotations lifecycle views | Slice 9 | planned |
| 15 | Admin: customers management | Slice 10 | planned |
| 16 | Admin: agent/broker management | Slice 11 | planned |
| 17 | Admin: corporate account management | Slice 12 | planned |
| 18 | Admin: internal staff & settings | Slice 13 | planned |
| 19 | Broker portal: auth & shell | Slice 14 | planned |
| 20 | Broker: booking wizards (individual & corporate) | Slice 15 | planned |
| 21 | Broker: bookings & corporate account views | Slice 16 | planned |
| 22 | Accessibility & responsive pass (admin tables) | Deferred | planned |
| 23 | i18n / multi-region (Kenya, Tanzania) | Deferred | planned |

## Foundations

### 1. Stack & architecture · done
Decide the React stack (routing, data fetching, forms, state, styling) and scaffold on top of the existing Vite + React 19 + TS base already in `frontend/`.
**Done when:** the stack is recorded in a spec and `npm run dev`/`npm run build` succeed with routing, a data-fetching client, and a form library wired to a placeholder page.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Build it: `/develop stack & architecture`
   - [x] Scaffold React Router, TanStack Query, React Hook Form + Zod, Tailwind + Radix UI onto the existing Vite scaffold
   - [x] Wire the typed fetch wrapper, strict TypeScript, and the security tooling (Dependabot, npm audit CI gate, eslint-plugin-security, base CSP)
   - [x] Confirm `npm run dev` and `npm run build` succeed with all layers wired to a placeholder page
- [x] Verify it: `/check verify stack & architecture`
- [x] Test it: `/test stack & architecture`
Spec 0001 · code in `frontend/src/`, `frontend/vite.config.ts`, `frontend/.github/`

### 2. Coding standards & tooling · done
Capture conventions (component structure, naming, folder layout, commit hygiene) and install lint/format/pre-commit enforcement from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint/format/pre-commit run clean.
- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`
- [x] Check it runs clean: `/test`
code in `frontend/AGENTS.md`, `frontend/package.json`, `frontend/scripts/install-git-hooks.mjs`

### 3. Frontend data contracts (API types & mocking) · done
TypeScript types for every payload this frontend sends/receives, matching the backend developer's planned NestJS surface (REVERSE_ENGINEERING.pdf §6, §12, §13: quotations, travelers, plans, payment transactions, contracts, admin/broker resources). Includes a mock/dev server strategy so frontend work isn't blocked on backend delivery.
**Done when:** every entity in the core loop (quote, plan, traveler, payment transaction, contract) has a typed contract, and the app can run fully against mocks with no live backend.
- [x] Design it (spec): `/architect frontend data contracts`
- [x] Build it: `/develop frontend data contracts`
   - [x] Zod schemas + inferred types for all 6 entities (Quote, Traveler, Plan, PaymentTransaction, Contract, Country)
   - [x] 5 typed API functions on `apiClient`, plus MSW mock handlers for all 5 endpoints
   - [x] Edge cases wired: expired selection token, payment timeout, contract issuance failure, ownership checks
- [x] Verify it: `/check verify frontend data contracts`
- [x] Test it: `/test frontend data contracts`
Spec 0002 · code in `frontend/src/lib/contracts/`, `frontend/src/lib/api/travel.ts`, `frontend/src/mocks/`

### 4. Design system & UI foundation · in-progress
Token set from REVERSE_ENGINEERING.pdf §9 (navy #003764 primary, gold #866000 accent, status colors, Roboto public / Source Sans Pro admin) plus base components (button, input, select, modal, table, toast, stepper) shared across public/admin/broker.
**Done when:** design tokens are centralized (not hardcoded hex per component), and base components handle focus/keyboard states.
- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
   - [x] CSS custom property tokens wired through Tailwind v4 `@theme`, matching REVERSE_ENGINEERING.pdf §9.1 exactly
   - [x] Button, Input, Select, Modal, Toast, Stepper, Table primitives, each with a density variant, built on the spec 0001 Radix primitives
   - [x] Accessibility rules enforced (focus ring, 4.5:1 contrast, keyboard operability, screen-reader error announcement) plus a component demo/catalog route
- [x] Verify it: `/check verify design system & UI foundation`
- [ ] Test it: `/test design system & UI foundation`
code in `frontend/src/index.css`, `frontend/design.md`, `frontend/src/components/ui/`, `frontend/src/pages/ComponentCatalog.tsx`
Spec 0003 · code (filled by /develop)

### 5. App shell & role-based routing
One `<AppShell variant="public | admin | broker | auth">` replacing the legacy app's 8 duplicate layouts (§9.4, §13). Route guard reads the auth role claim to gate `/admin` and `/broker` areas.
**Done when:** switching between public, admin, and broker routes renders the correct shell, and an unauthenticated user is redirected away from gated areas.
- [ ] Design it (spec): `/architect app shell & role-based routing`

## Slice 1: Core quote-to-purchase loop (client)

### 6. Core quote-to-purchase loop (client)
The walking skeleton: the 5-step public wizard end to end on real (or mocked-to-contract) data — itinerary entry → plan selection (calls the pricing/plans endpoint) → traveler details (dynamic rows) → billing/account gate → confirmation and quote creation. This is the thinnest real thread through every layer; payment and account creation are stubbed to their real contracts here and thickened in Slices 2 and 3.
**Done when:** a user can enter an itinerary, see priced plans, add traveler details, and reach a confirmation screen that has created a real quotation record against the data contracts from Feature 3.
- [ ] Design it (spec): `/architect core quote-to-purchase loop`

## Slice 2: Mobile-money payment & status polling

### 7. Mobile-money payment & status polling
Thickens the core loop with real payment: network/phone entry, initiate mobile-money push, poll (or subscribe to) status until success/failure, then link to the issued policy PDF. Legacy app polled client-side every 5s for 60 attempts (§11.6); this spec should decide polling vs push (WebSocket/SSE) against what the backend actually exposes.
**Done when:** a paid quotation transitions the UI from pending → success/failure state without a full page reload, and a failed/timed-out payment is recoverable (retry) not a dead end.
- [ ] Design it (spec): `/architect mobile-money payment & status polling`

## Slice 3: Client account: signup, login, password reset

### 8. Client account: signup, login, password reset
Real auth for the customer role: signup, login, password reset request/confirm. Replaces the legacy Bootstrap-modal login/signup (§8.1) with first-class pages/modals per the design system.
**Done when:** a customer can sign up, log in, log out, and recover a forgotten password, and the core loop (Feature 6) requires login before confirmation exactly where the legacy flow gated it.
- [ ] Design it (spec): `/architect client account auth`

## Slice 4: Client purchases history & policy detail

### 9. Client purchases history & policy detail
Logged-in customer's quote/purchase list and a single-purchase detail view (status, premium, traveler list, policy PDF link).
**Done when:** a customer sees all their past quotes/purchases with correct status badges, and can open one to see full detail and download/view its certificate.
- [ ] Design it (spec): `/architect client purchases history`

## Slice 5: Certificate / embassy-letter public validator

### 10. Certificate / embassy-letter public validator
Public, unauthenticated QR-scan landing pages that check a certificate/embassy-letter code's authenticity (§8.1, §13). Low risk, high value, no auth required.
**Done when:** visiting `/certificate-validator/:code` and `/embassy-letter-validator/:code` with a valid code shows authentic policy details, and an invalid/expired code shows a clear failure state.
- [ ] Design it (spec): `/architect certificate validator pages`

## Slice 6: Admin: auth, shell, and role-filtered navigation

### 11. Admin: auth, shell, and role-filtered navigation
Admin login (+ lock screen), the AdminLTE-inspired shell (§9.4) built on Feature 5's `<AppShell variant="admin">`, and — unlike the legacy app where this was dead plumbing (§8.4) — a genuinely enforced role-filtered sidebar driven by the backend's role/permission response.
**Done when:** an admin logs in, sees a sidebar filtered to their actual permissions (not every item), and a role without a permission cannot navigate to or deep-link that page.
- [ ] Design it (spec): `/architect admin auth, shell & navigation`

## Slice 7: Admin: dashboard KPIs

### 12. Admin: dashboard KPIs
Landing dashboard: page visits, exchange rates, buy comparison chart, monthly quotes by trip-plan chart (§8.2).
**Done when:** the dashboard renders all four widgets from live/mocked data with loading and empty states, and is responsive down to tablet width.
- [ ] Design it (spec): `/architect admin dashboard`

## Slice 8: Generic admin data table / CRUD component

### 13. Generic admin data table / CRUD component
One config-driven table + CRUD-modal component (§11.4, §13) replacing what was ~20 hand-rolled DataTable files in the legacy app. Every subsequent admin list/CRUD feature consumes this rather than reinventing it.
**Done when:** the component supports server-side pagination/sort/filter, row actions, and a create/edit modal from a column+field config, proven against one real entity (quotations).
- [ ] Design it (spec): `/architect admin data table component`

## Slice 9: Admin: quotations lifecycle views

### 14. Admin: quotations lifecycle views
Pending / paid / cancelled quotations, bookings, quote detail/edit, proposal view, cancel/revert-cancel — built on Feature 13's generic table (§8.2).
**Done when:** an admin can view, filter, and open any quotation regardless of status, and cancel/revert a quotation with the status change reflected immediately.
- [ ] Design it (spec): `/architect admin quotations lifecycle`

## Slice 10: Admin: customers management

### 15. Admin: customers management
Customer list views (all / individual / agent-referred) and a 360° customer profile page (§8.2).
**Done when:** an admin can search/filter customers and open a profile showing their full quote/purchase history in one place.
- [ ] Design it (spec): `/architect admin customers management`

## Slice 11: Admin: agent/broker management

### 16. Admin: agent/broker management
Agent management list, agent profile, agent-watch production monitoring dashboard with a cancelled-view variant, broker invite flow (§8.2).
**Done when:** an admin can view an agent's production stats and cancelled-bookings view, and invite a new agent through a form (not a plaintext-OTP email, unlike the legacy flow — see Feature 3's contract for the intended invite mechanism).
- [ ] Design it (spec): `/architect admin agent management`

## Slice 12: Admin: corporate account management

### 17. Admin: corporate account management
Activate/deactivate corporate accounts, manage per-account daily rate, rate-change history (§8.2, §5.2 `coorpaccounts`/`copaccount_rates`).
**Done when:** an admin can activate, deactivate, and change the daily rate for a corporate account, with prior rates visible as history.
- [ ] Design it (spec): `/architect admin corporate accounts`

## Slice 13: Admin: internal staff & settings

### 18. Admin: internal staff & settings
Staff account CRUD with role/level assignment, app settings (exchange rates, general config), admin profile (photo, password change, permissions badge list) (§8.2).
**Done when:** an admin with the right permission can create/edit/disable a staff account and assign a role, and app-wide settings (e.g. exchange rates) are editable and take effect without a deploy.
- [ ] Design it (spec): `/architect admin staff & settings`

## Slice 14: Broker portal: auth & shell

### 19. Broker portal: auth & shell
Broker login and one consistent broker shell (§11.8 flags the legacy portal's inconsistent public/admin mash-up — this rebuild picks one, per Feature 5's `<AppShell variant="broker">`).
**Done when:** a broker logs in and sees a shell consistent with (not a mash-up of) the public and admin shells, gated by the same role-guard pattern as admin.
- [ ] Design it (spec): `/architect broker auth & shell`

## Slice 15: Broker: booking wizards (individual & corporate)

### 20. Broker: booking wizards (individual & corporate)
Broker books on behalf of a retail client (paid) or a corporate account (billed on credit, instant-issue "quick letter" flow per §4 step 3) (§8.3).
**Done when:** a broker can complete a booking for a walk-in client through the same pricing/travelers flow as the public wizard, and a corporate booking issues its certificate/letter immediately without a payment step.
- [ ] Design it (spec): `/architect broker booking wizards`

## Slice 16: Broker: bookings & corporate account views

### 21. Broker: bookings & corporate account views
Broker's own bookings list, corporate bookings list, corporate accounts list + single-account detail/ledger, broker profile (§8.3).
**Done when:** a broker sees only their own bookings and linked corporate accounts (ownership-scoped, unlike the legacy app's gap here — §3.4), and can open a corporate account's transaction ledger.
- [ ] Design it (spec): `/architect broker bookings & corporate views`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Accessibility & responsive pass (admin tables)**: legacy admin DataTables were desktop-only with no stacked/responsive pattern (§11.7); worth a dedicated pass once the generic table component (Feature 13) is proven · needs a decision
- **i18n / multi-region (Kenya, Tanzania)**: this codebase's primary focus is Uganda (§1); Kenya/Tanzania support is real future scope but not this pass · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Every other box is an execution box.

**Feature lifecycle:**

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` at spec capture | `Design it` ticked; spec linked; `Build it: /develop <feature>` + milestones; `Verify it` and `Test it` closing boxes (Beta tier) |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | you, when you decide it is; `/sync` reconciles | the boxes you ran are ticked; Beta's suggested close point is after `/test` |

- **Next step** = the first unticked box.
- **Atomic build tasks live in the spec's `## Build plan`, not here.**
- **Status:** `planned` → `in-progress` → `done`, plus `dropped` (de-scoped, kept for history).
- **Workflow** (header line): the project default tier. Beta = `/check verify` then `/test` after `/develop`. A feature's own tier tag would override it; none do in this pass.

## /scope plan · Uganda Paygate Frontend Rebuild

**21 features planned (0 already on the scope, 2 deferred), build approach Tracer Bullet, workflow Beta.**
Next: `/clear`, then `/architect stack & architecture`
Heads up: every feature needs a decision (`/architect`) before `/develop` — that's expected at the start of a Tracer Bullet pass; Feature 3 (frontend data contracts) is the one that most depends on aligning with the backend developer early, since it's the seam between your work and theirs.
Scope written to `frontend/docs/scope/scope.md`.
