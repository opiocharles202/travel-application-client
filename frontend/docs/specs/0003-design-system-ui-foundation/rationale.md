# 0003. Design system and UI foundation: rationale

## Context

Every screen across all three portals (public, admin, broker) depends on this foundation existing before it can be built well: `docs/scope/scope.md` lists it as a Foundation feature, and the two immediately following slices (the core quote to purchase loop, then payment) both need real, styled components, not placeholders. Without it, each screen would invent its own button, its own spacing, its own color literal, exactly the drift `frontend/docs/REVERSE_ENGINEERING.pdf` documents happening in the legacy app: "No CSS custom properties or SCSS variables exist anywhere in the codebase; every hex value is a literal repeated (with some drift) across files" (section 9.1).

The legacy app also split visually by portal without a coherent system: the public site runs a custom Bootstrap-family theme with Roboto and Material/FontAwesome icons, admin and broker run AdminLTE 2.x with Source Sans Pro and AdminLTE's own icon set, and a third, mostly unused type pairing (Varela Round and Questrial) exists only in transactional emails. The reverse engineering document explicitly marks the color palette and layout structure "KEEP for rebuild" (section 9) while calling out the drift and the 8 near duplicate layout files as exactly what the rebuild should not repeat, and separately recommends collapsing everything into one parameterized `<AppShell variant>` (section 9.4, section 13). This spec applies the same principle one level down, to components and tokens, not just the shell.

Spec 0001 already chose Tailwind CSS with Radix UI primitives and installed Dialog, DropdownMenu, Select, Tooltip, Label, and Slot. This spec builds the actual styled component layer on top of those primitives; it does not choose a new styling approach.

## Options considered

### Option 1: CSS custom properties consumed via Tailwind v4's `@theme`, one density variant per component, Lucide for icons

Tokens live as `:root` CSS variables; Tailwind v4 reads them through `@theme` to generate utility classes automatically. Each base component (Button, Input, Select, Table row, and so on) accepts a `density: 'comfortable' | 'compact'` prop rather than the app shipping two parallel component sets. One icon library, Lucide, replaces the legacy's three overlapping icon systems.

**Pros**:

- One source of truth a browser DevTools user can inspect directly (a plain CSS variable), with Tailwind's utility generation layered on top, not a separate JS object that can drift from what Tailwind actually emits.
- A density variant means the admin/broker screens' denser layout need (real, documented in section 9.3 and 9.4) is satisfied without forking every component, matching the same "one parameterized shell, not eight duplicates" principle the document already asks for at the shell level.
- Lucide is the current standard choice for icon libraries pairing with Radix based component stacks (verified: actively maintained, 1500+ icons, full TypeScript support), so no new maintenance burden beyond what spec 0001 already committed to.

**Cons**:

- A density prop adds a small amount of conditional logic to every component instead of two cleanly separate, simpler implementations.
- Lucide's outline style is a genuine visual departure from the legacy app's Material Icons and AdminLTE glyphicon-style icons; this is an intentional modernization, not a like for like port, and should be named as such rather than assumed invisible.

### Option 2: A plain TypeScript tokens object, separate component sets per portal, keep each portal's legacy icon system

Tokens as a typed JS object imported into a Tailwind config; Button, Input, and so on built twice, once per visual density; icons stay split, Material/FontAwesome for public, AdminLTE's set for admin/broker.

**Pros**:

- Type safe token access from TypeScript without relying on a CSS variable string existing at the right name.
- No density branching logic inside any single component.

**Cons**:

- Loses the "one place, visually inspectable" property CSS variables have; syncing a JS token object with Tailwind's own generated utilities is an extra step that can drift, the same failure mode the reverse engineering document is explicitly warning against.
- Separate component sets per portal directly repeats the legacy app's own documented mistake (8 near duplicate layout files, duplicated patterns across admin/public) rather than fixing it.
- Three icon systems means three dependencies to keep patched and three visual languages users experience switching between admin and public views of the same product.

## Rationale

The engineer chose Option 1 directly across four separate questions in the staged design conversation (design source, component inventory, density approach, token mechanism, icon approach): every answer favored consolidation into one system with variants, over separate systems per portal. This is consistent with the reverse engineering document's own stated intent for the rebuild (section 9, section 9.4, section 13: one design token set, one parameterized shell) and with `docs/scope/scope.md`'s Feature 5 description, which explicitly frames the target `<AppShell variant>` as "replacing the legacy app's 8 duplicate layouts." A component level density variant is the same principle applied one layer down: the visual density genuinely differs between a five step public wizard and a dense admin data table, but the underlying component (a button is still a button) does not need two implementations to express that difference.

## References

**Project sources** (verifiable, in this repo):

- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 9 (design system: colors, typography, layout, explicitly marked KEEP for rebuild)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 9.4 (the `<AppShell variant>` consolidation recommendation)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 13 (recommended React frontend architecture: design tokens as CSS variables / a theme config from day one)
- `frontend/docs/scope/scope.md`, Feature 4 (design system & UI foundation) and Feature 5 (app shell & role based routing)
- `frontend/docs/specs/0001-stack-and-architecture/`, the Tailwind CSS plus Radix UI primitives decision this spec builds on
- `frontend/AGENTS.md`, the accessibility baseline (WCAG AA) this spec's concrete rules satisfy

**Practices & standards**:

- Design tokens as CSS custom properties, consumed by the utility framework rather than duplicated in a parallel JS structure
- WCAG 2.1 AA as the accessibility floor (4.5:1 text contrast, full keyboard operability, visible focus indication)

**Links** (web verified during the Stage (c) landscape check):

- Lucide for React: https://lucide.dev/guide/react/
- lucide-react on npm: https://www.npmjs.com/package/lucide-react
