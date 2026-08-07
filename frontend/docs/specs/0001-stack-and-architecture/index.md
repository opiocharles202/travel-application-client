# 0001. Stack and architecture for the Uganda Paygate frontend rebuild

**Date**: 2026-08-07
**Status**: Accepted

## Summary

This decides the full React stack for the frontend rebuild of ICEA LION's Uganda travel insurance platform: routing, server state, forms, styling, the HTTP client, how login tokens are kept safe in the browser, and the testing and security tooling. Everything here builds on the existing Vite plus React 19 plus TypeScript scaffold already in the repository. The choices favor proven, actively maintained tools with a small dependency footprint, because this app handles payments and personal traveller data even though the backend is being built separately. Building it correctly here means every later feature (the quote wizard, admin panel, broker portal) inherits the same secure, typed foundation instead of reinventing it.

## Requirements

This is a decision only spec (ARCHITECTURE mode); it has no build plan of its own. The scaffold task under the "Stack and architecture" scope feature derives its steps from the `## Proposed stack` below at build time.

## Decision

**Chosen option**: Vite plus a focused set of best in class libraries, chosen layer by layer (full comparison against a full server rendering framework and a hand rolled, dependency free approach is in `rationale.md`).

The frontend stays on Vite with React 19 and TypeScript, and adds React Router v7 for routing, TanStack Query for server state, React Hook Form with Zod for forms and validation, Tailwind CSS with Radix UI primitives for styling and accessible components, a small typed fetch wrapper for HTTP, and Vitest, React Testing Library and Playwright for testing, with Dependabot, an `npm audit` CI gate, `eslint-plugin-security` and a Content Security Policy as the security baseline.

## Feature design

Not applicable in the same form as a FEATURE spec; the stack itself is the design. The scaffold task (this feature's execution box) will apply the choices below.

**Configuration required**:
- `VITE_API_BASE_URL`: the backend API's base URL, provided per environment (local, staging, production), never hardcoded.
- No secrets belong in this repository at any point; the frontend never holds an API key, JWT signing secret or database credential. If a future integration seems to need one client side, that is itself a signal to stop and design a backend proxy instead.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict mode | Already the scaffold's language; strict mode is part of the security baseline (catches whole classes of null or undefined bugs at compile time, before they become runtime security issues). |
| Build tool | Vite | Already scaffolded; fast dev server and build, first class React and TypeScript support. |
| UI framework | React 19 | Already scaffolded; the version the reverse engineering document's own recommended architecture assumes. |
| Routing | React Router v8 (corrected during scaffolding from the originally decided v7; see Follow up) | Actively maintained, integrates cleanly with Vite, and supports the nested layout plus route guard pattern the app shell and role based areas need. |
| Server state and data fetching | TanStack Query | Handles caching, retries and polling in one place; the payment status polling flow (legacy section 4, step 5) is exactly the kind of repeated poll TanStack Query is built for, replacing a hand rolled `setInterval` loop. |
| Forms and validation | React Hook Form with Zod | Minimises re-renders for the multi-step wizard and its dynamic traveller rows; Zod schemas double as runtime input validation and TypeScript types, which directly satisfies the security baseline's requirement to validate every input boundary rather than trust it. |
| Styling and components | Tailwind CSS with Radix UI primitives | Utility first styling maps design tokens (the navy and gold palette in section 9 of the reverse engineering document) straight into configuration instead of scattered hex literals; Radix supplies accessible, unstyled interactive primitives (modal, dropdown, select) so accessibility is not reinvented per component. |
| HTTP client | Native fetch with a thin typed wrapper | One dependency fewer than an HTTP library; the wrapper centralises the base URL, the auth header, and Zod based response parsing in one audited place, and TanStack Query already provides the retry and caching behaviour a library like axios would otherwise add. |
| Client side auth token handling | In memory access token plus an httpOnly refresh cookie pattern (backend dependent, see Follow up) | Never storing the access token in `localStorage` or `sessionStorage` removes the single biggest client side token theft vector (a cross site scripting bug reading a stored token); this is the direct fix for the legacy app's token-in-URL and token-in-body pattern. |
| Testing | Vitest, React Testing Library, Playwright | Vitest shares Vite's own configuration and transform pipeline, so it needs no separate build setup; React Testing Library covers component behaviour, Playwright covers the end to end flows that matter most here (the quote wizard, payment polling, admin CRUD). |
| Dependency security | Dependabot plus an `npm audit` gate in CI | Verified as the current best practice default for a single repository on GitHub (lower setup cost than Renovate, which is aimed at multi repo or complex regex update rules this project does not need). |
| Lint security rules | `eslint-plugin-security` added to the existing ESLint config | A maintained, current plugin that flags common insecure patterns (unsafe regex, `eval`, unsafe object property access) directly in the editor and in CI, catching mistakes before review rather than after. |
| Content security | A Content Security Policy defined from the app shell outward | Sets the browser's own boundary on what scripts, styles and connections the app is allowed to load, which is a defence that holds even if a dependency is later compromised; must be defined once, in the app shell, not per page. |

## Consequences

**Positive**:
- Every later feature (the wizard, admin tables, broker portal) inherits typed, validated data flow and a consistent design token system instead of each screen inventing its own approach.
- The security baseline (dependency audit, strict types, schema validated input, in memory tokens, CSP, security lint) is set once here and captured into `AGENTS.md` by the next foundation step, so no later feature has to re-decide it.
- Small, focused dependencies are each independently auditable and replaceable; there is no single large framework whose entire security posture this project inherits wholesale.

**Negative / tradeoffs**:
- No server rendering; if a genuine SEO requirement for the public marketing pages surfaces later, that is a new decision (likely Next.js or a static pre-render step for just those pages), not something this stack provides for free today.
- More individual libraries to keep patched than a single framework bundle, though each is small and Dependabot plus the `npm audit` CI gate exist specifically to manage that ongoing cost.
- The in memory token plus httpOnly refresh cookie pattern is the correct security posture, but it does not work unless the backend actually sets an httpOnly, secure, same-site cookie for refresh; if the backend cannot or will not do that, this decision has to be revisited (see Follow up).

**Neutral**:
- Radix UI provides unstyled primitives, not a finished component library, so the design system foundation feature still has real work to do building the visual layer on top of it; this is expected and already scoped as its own feature.

## Follow-up

- [x] **Correction, not a preference change:** during scaffolding, `npm audit` flagged GHSA-qwww-vcr4-c8h2 (high severity, RSC Mode CSRF Bypass Allows Action Execution Before 400 Response) affecting react-router 7.12.0 through 8.2.0. The originally decided v7 line is inside the vulnerable range with no v7 patch available; only 8.3.0 and later fix it. Per the security baseline in `docs/scope/scope.md` (no known high or critical severity dependency vulnerabilities), the project was scaffolded on react-router ^8.3.0 instead of v7. The routing decision itself (React Router as the library) is unchanged; only the major version differs from what this spec originally recorded.
- [ ] Confirm with the backend developer whether the API can set an httpOnly, secure, same-site refresh cookie on login. This is load bearing for the token handling row above; if the backend cannot support it, `/architect` needs to revisit client side auth token handling (the fallback is an in memory access token only, with re-login on expiry, no silent refresh) before the client account auth feature (scope feature 8) is built.
- [ ] `/audit` should capture this stack, the security baseline, and the strict sequencing rule (one feature at a time, in order, per the scope header) into root `AGENTS.md` immediately after the scaffold task lands, so every later `/develop` run inherits it automatically.
- [ ] Frontend data contracts (scope feature 3) should define the Zod schemas for every entity in the core loop against the API shapes documented in the reverse engineering document's section 6, and should decide the mock server strategy so the wizard can be built and demoed before the real backend exists.

## Rationale

Reasoning, options considered, and references: see `rationale.md`.
