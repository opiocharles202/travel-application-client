# 0005. Core quote to purchase loop: rationale

## Context

This is the first feature in the project that produces a real, customer facing screen. Every foundation feature so far (stack, tooling, data contracts, design system, app shell) exists to make this one buildable without inventing anything mid-build: the Zod contracts and MSW mocks (spec 0002) already model every entity and endpoint this wizard needs, the tokens and base components (spec 0003) already define what a button, input, and stepper look like, and the public `AppShell` (spec 0004) is what this wizard renders inside.

Per the project's Tracer Bullet build approach (`docs/scope/scope.md`), this feature is Slice 1: the thinnest real thread through every layer, not a fully thickened feature. The scope's own description names two things explicitly deferred to later slices: real payment (Slice 2, scope feature 7) and real account creation (Slice 3, scope feature 8, client account auth). Neither exists yet, which is why the wizard's third step (historically a login/signup gate in the legacy app) cannot be a real auth gate here; there is nothing to gate against.

The engineer made two scope calls mid-design that shape this spec directly: the billing/account step collects guest checkout details only, not a stubbed login form with no backend behind it, and the plan selection step shows full pricing detail (including add-ons) rather than a simplified placeholder, because spec 0002's `Plan.addOns` already directly affects `totalPayable`, so a simplified view would show the customer a price they would not actually pay.

## Options considered

### Option 1: Guest checkout gate, full plan detail, one React Hook Form instance across all 5 steps

**Pros**:

- Nothing is built against an auth mechanism that does not exist yet; when scope feature 8 (client account auth) lands, it adds a real login/signup option alongside guest checkout rather than replacing throwaway UI.
- The price shown at plan selection is the real price the customer will pay, add-ons included, matching what `createQuote` will actually charge (spec 0002).
- One form instance means the final `createQuote` call submits data that has already been validated step by step, not reassembled from disparate state sources.

**Cons**:

- A single large form instance spanning 5 steps carries more internal complexity (per-step validation scoping, dynamic traveler field arrays) than 5 fully isolated step components would.

### Option 2: Stub a login/signup form now, minimal plan cards, per-step isolated forms

**Pros**:

- Each step's logic is simpler in isolation.
- Visually closer to the legacy app's actual login modal at this step.

**Cons**:

- A stubbed login/signup form with no working backend behind it is exactly the kind of throwaway UI work the engineer explicitly rejected; it would need to be rebuilt, not extended, once scope feature 8 designs real auth.
- Minimal plan cards omit add-ons that directly change the payable price, risking a screen that looks broken (price changes unexpectedly) once add-ons matter.

## Rationale

The engineer's own answers across this feature's design conversation directly settle Option 1 over Option 2 on every dimension asked. This also aligns with the Tracer Bullet approach's own principle: build the thin thread with real structure throughout, faking only what genuinely has no counterpart yet (an auth backend), never fabricating a UI surface that implies a capability that does not exist.
