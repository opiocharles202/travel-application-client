# 0003. Design system and UI foundation

**Date**: 2026-08-07
**Status**: In Progress

## Summary

This defines the visual language every screen in the app will use: the color and typography tokens taken from the legacy application's own documented, verified CSS (which the reverse engineering document explicitly says to keep), and the base components (button, input, select, modal, table, toast, stepper) built on top of the Radix primitives already installed. Instead of three visual systems drifting across public, admin, and broker like the legacy app had, this is one system with a density setting, so the same button looks and behaves consistently everywhere while still being compact enough for a dense admin table. Getting this right now means every later screen picks components off a shelf instead of inventing its own spacing, color, or focus behavior.

## Context

See `rationale.md` for the full context, options considered, and references.

## Requirements

**User stories**:

- As a frontend engineer, I want a single set of design tokens and base components, so that every screen I build looks consistent without me choosing colors or spacing by hand.
- As a user of any portal (public, admin, broker), I want the same visual language and interaction behavior across the whole product, so that switching contexts doesn't feel like using a different app.
- As a user relying on a keyboard or a screen reader, I want every interactive component to be fully operable and clearly announced, so that the product is usable regardless of how I interact with it.

**Acceptance criteria**:

- **AC-1**: Every color, spacing, and radius value used anywhere in the app is defined once as a CSS custom property in `:root` and consumed through Tailwind v4's `@theme`; no component contains a hardcoded hex value or a magic spacing number.
- **AC-2**: The color tokens match `frontend/docs/REVERSE_ENGINEERING.pdf` section 9.1's verified palette exactly (primary navy `#003764`, primary dark `#001d35`, primary hover `#005187`, accent gold `#866000`, accent light `#a37e00`, success `#28a745`, warning `#ffc107`, danger `#dc3545`).
- **AC-3**: Roboto loads and renders on any component rendered in a `public` context; Source Sans Pro loads and renders on any component rendered in an `admin` or `broker` context.
- **AC-4**: Button, Input, Select, Modal (Dialog), Toast, Stepper, and Table (row/cell primitives) exist as components, each built on its matching Radix primitive where one exists (Select, Dialog for Modal, Tooltip where used), each accepting a `density: 'comfortable' | 'compact'` prop that visibly changes padding and, where applicable, font size.
- **AC-5**: Every interactive component (Button, Input, Select trigger, Modal close/actions, Toast dismiss, Stepper controls) shows a visible focus ring when reached by keyboard `Tab` navigation, and is fully operable with keyboard alone (no mouse-only affordance).
- **AC-6**: Every token pairing used for body text against its background meets a 4.5:1 contrast ratio (WCAG AA); this is verified for the primary navy on white, the accent gold on white, and each status color against its typical background.
- **AC-7**: A form field in an error state (Input, Select) both changes visually (the danger token) and exposes the error to assistive technology via `aria-invalid` and an associated `aria-describedby` error message, not color alone.
- **AC-8**: All icons anywhere in the app come from `lucide-react`; no Material Icons, FontAwesome, or AdminLTE icon classes are introduced.
- **AC-9**: A Storybook-style or equivalent visual catalog page (or, at minimum, a rendered demo route) exists showing every component in both density variants, so a later screen can be built by reference without reading component source.

## Options considered

See `rationale.md`.

## Decision

**Chosen option**: CSS custom properties consumed via Tailwind v4's `@theme`, one component API per element with a `density` variant prop (not separate component sets per portal), and `lucide-react` as the single icon library across all three portals.

Tokens are sourced verbatim from the reverse engineering document's verified legacy CSS (section 9.1), not reinvented. Typography splits by portal context (Roboto public, Source Sans Pro admin/broker) per the document's own split, with the third, mostly unused email font pairing (Varela Round, Questrial) explicitly out of scope for this pass. Accessibility rules are concrete, not deferred: visible focus, 4.5:1 contrast, full keyboard operability, and screen reader announced form errors are acceptance criteria, not aspirations.

## Feature design

**Design system**:

Tokens defined as CSS custom properties in `src/index.css` (already the Tailwind v4 entry point per spec 0001), consumed via `@theme` so Tailwind generates matching utility classes (`bg-primary`, `text-accent`, and so on) automatically. No parallel JS token object; a component that needs a token in inline style (rare, e.g. a computed chart color) reads the CSS variable directly via `var(--color-primary)`.

| Token | Value | Source |
|---|---|---|
| `--color-primary` | `#003764` | REVERSE_ENGINEERING.pdf §9.1, primary navy |
| `--color-primary-dark` | `#001d35` | §9.1, darker navy (footers, darker surfaces) |
| `--color-primary-hover` | `#005187` | §9.1, hover/active states, links |
| `--color-accent` | `#866000` | §9.1, primary CTA buttons |
| `--color-accent-light` | `#a37e00` | §9.1, secondary links/labels, wordmark |
| `--color-success` | `#28a745` | §9.1, paid/success states |
| `--color-warning` | `#ffc107` | §9.1, pending states |
| `--color-danger` | `#dc3545` | §9.1, failed/cancelled states |
| `--font-public` | `'Roboto', sans-serif` | §9.2, public site typography |
| `--font-admin` | `'Source Sans Pro', sans-serif` | §9.2, admin & broker typography (AdminLTE default) |
| `--radius-*`, `--spacing-*` | a small consistent scale (e.g. 4/8/12/16/24px spacing, 4/8px radius) | not documented in the legacy app (it had none, per §9.1); defined fresh here as the single scale every component uses |

**Component inventory** (existing vs net new): all net new. Built on the Radix primitives spec 0001 already installed:

| Component | Radix primitive | Density variant behavior |
|---|---|---|
| Button | none (native `<button>` + Slot for `asChild`) | padding and font size shrink under `compact` |
| Input | none (native `<input>`, styled) | height and padding shrink under `compact` |
| Select | `@radix-ui/react-select` | trigger height and option row height shrink under `compact` |
| Modal | `@radix-ui/react-dialog` | internal padding shrinks under `compact`; overlay/animation unaffected |
| Toast | none yet installed; add `@radix-ui/react-toast` | padding shrinks under `compact` |
| Stepper | none (custom, built on Button + tokens) | step indicator size shrinks under `compact` |
| Table (row/cell primitives) | none (native `<table>`, styled) | row height and cell padding shrink under `compact`; the full generic sortable/paginated data table is scope Feature 13, out of scope here |

**Asset strategy**: icons via `lucide-react` (tree-shakeable, one `<Icon />` import per icon used, no icon font or sprite sheet). No other image assets are required by this feature; component demo/catalog content uses text and token swatches only.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render any component in a `public` route | font family = Roboto | the route's `AppShell variant` (feature 5, not yet built; until then, a `data-portal` attribute set directly per demo/consuming route) |
| Render any component in an `admin`/`broker` route | font family = Source Sans Pro | same `data-portal` mechanism |
| Render a Button/Input/Select/Modal/Toast/Stepper | density = comfortable or compact | an explicit `density` prop passed by the consuming screen; never inferred, so a screen author always states its own density rather than the component guessing from context |

**Key invariants**:

- No component file contains a literal hex color or an arbitrary Tailwind bracket value (`bg-[#003764]`); every color reference is a token.
- Every component that can show an error state (Input, Select) exposes it identically: the danger token visually, `aria-invalid="true"` and `aria-describedby` pointing at the message programmatically.

**Security model**: not applicable; this feature introduces no data access, auth, or user-scoped behavior. The one relevant constraint is that no component uses `dangerouslySetInnerHTML` (spec 0001's security baseline), including the Toast and Modal components, which are common places that pattern gets introduced for "rich" content.

**Configuration required**: none. No new environment variables or credentials.

**Critical test scenarios**:

- Happy path: every component renders in both density variants without visual breakage or console error, verifies **AC-4, AC-9**.
- Failure case: an Input or Select in an error state is both visually distinct and exposes `aria-invalid`/`aria-describedby`, verifies **AC-7**.
- Accessibility: `Tab` through every interactive component and confirm a visible focus ring appears on each, with no element skipped or trapped, verifies **AC-5**.

## Build plan

1. Define the token set as CSS custom properties in `src/index.css` and wire them through Tailwind v4's `@theme`, satisfies **AC-1, AC-2**.
2. Load Roboto and Source Sans Pro (self-hosted or a font loading strategy consistent with the CSP already set in spec 0001, which restricts `font-src 'self'`) and apply per portal context via a `data-portal` attribute, satisfies **AC-3**.
3. Build Button (native + Slot, density variant), satisfies **AC-4, AC-5, AC-6**.
4. Build Input, including the error state (`aria-invalid`, `aria-describedby`), satisfies **AC-4, AC-5, AC-6, AC-7**.
5. Build Select on `@radix-ui/react-select`, including the error state, satisfies **AC-4, AC-5, AC-6, AC-7**.
6. Build Modal on `@radix-ui/react-dialog`, satisfies **AC-4, AC-5, AC-6**.
7. Install `@radix-ui/react-toast`; build Toast, satisfies **AC-4, AC-5, AC-6**.
8. Build Stepper (custom, on top of Button and the token set), satisfies **AC-4, AC-5, AC-6**.
9. Build the Table row/cell primitives, satisfies **AC-4, AC-5, AC-6**.
10. Install `lucide-react`; replace any placeholder icon usage (none currently exist, this establishes the pattern for all future icon usage), satisfies **AC-8**.
11. Build a demo/catalog route rendering every component in both density variants, satisfies **AC-9**.
12. Write tests: a render/interaction test per component (focus, keyboard operability, error state where applicable), and an automated contrast check for the documented token pairings, satisfies **AC-5, AC-6, AC-7**.

All 12 tasks built. Code in `src/index.css`, `design.md`, `src/components/ui/`, `src/pages/ComponentCatalog.tsx`. 58/58 tests passing (`npm run test:unit`); typecheck, lint, build, and the e2e smoke test all clean.

Two real gaps were caught during the actual contrast verification (AC-6), not assumed from the raw hex values the spec named: rendering `--color-success` or `--color-warning` as plain text on white fails WCAG AA (3.13:1 and 1.63:1); both now pair with `--color-on-success`/`--color-on-warning` (`--color-primary-dark`, 5.46:1 and 10.50:1) instead. And the initial `disabled:opacity-50` pattern on the Button/Input/Select components measured ~2.13:1 on the gold accent button, well under AA; replaced with dedicated `--color-disabled-bg`/`--color-disabled-text` tokens (9.13:1) used uniformly regardless of variant. Both are locked in by `src/lib/contrast.test.ts` so a future edit to the raw token values can't silently regress either.

## Consequences

**Positive**:

- Every later screen (the quote wizard, admin tables, broker views) builds from a proven, accessible, tokenized component set instead of each author making these calls independently and drifting, the exact failure the legacy app is documented to have.
- Accessibility is built in from the first component, not retrofitted after ~30 screens exist.
- One icon library and one token source materially shrinks the dependency and maintenance surface compared to the legacy app's three overlapping visual systems.

**Negative / tradeoffs**:

- The density variant adds real branching logic to every component; a future component that resists a clean two-state density split will need a considered exception, not a forced fit.
- Lucide's outline icon style is a visible departure from the legacy app's Material Icons and AdminLTE glyphicons; this is an intentional modernization the engineer should be aware is a visible change, not an invisible technical swap.
- The spacing/radius scale has no legacy precedent to match (the old app had none, per the reverse engineering document); it is defined fresh here and becomes a real constraint every later screen inherits, so getting it wrong here is more costly to fix than tuning a color later would be.

**Neutral**:

- The full generic, sortable, paginated admin data table (scope Feature 13) is out of scope; this feature only builds the Table's row/cell visual primitives that Feature 13 will assemble into that heavier component.

## Follow-up

- [ ] Confirm the self-hosted font files (Roboto, Source Sans Pro) are added under a license permitting redistribution, and that the CSP's `font-src 'self'` (spec 0001) is satisfied once the actual font loading mechanism is implemented.
- [ ] When scope Feature 5 (app shell & role based routing) is architected, its `<AppShell variant>` should own setting the `data-portal` attribute this spec's typography rule reads, rather than each screen setting it individually.
- [ ] When scope Feature 13 (generic admin data table) is architected, it should consume this spec's Table row/cell primitives rather than building its own.

## Rationale

Reasoning, options considered, and references: see `rationale.md`.
