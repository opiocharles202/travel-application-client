# 0004. App shell: rationale

## Context

The legacy application ran 8 near duplicate Twig layout files (2 entirely unreferenced) to serve three visually distinct portals: a public Bootstrap-family theme, and an AdminLTE 2.x shell shared inconsistently between admin and broker, where broker pages sometimes used the public header and sometimes the admin scripts (`frontend/docs/REVERSE_ENGINEERING.pdf`, section 9.4). The document explicitly names this as duplication to fix, recommending the rebuild "collapse these into a single `<AppShell variant=\"public | admin | broker | auth\">` component" (section 9.4, section 13).

Every later screen depends on this shell existing: the core quote to purchase loop (scope feature 6) needs the public shell, and every admin/broker feature after it (scope features 11 to 21) needs their respective shells and a consistent place to render navigation. `design.md` (spec 0003) already records the composition pattern this feature builds to (public: header, content, footer; admin/broker: header, sidebar, content, no footer), so this feature's job is implementation, not re-deciding the layout direction.

The reverse engineering document's original scope for this feature also named a role based route guard (reading an auth claim to gate `/admin` and `/broker`). The engineer explicitly directed, partway through this feature's design conversation, to drop authentication and route guarding from this pass entirely. This is a real, deliberate descope, not an oversight: no login feature has been built yet (client account auth is scope feature 8, not yet started; admin/broker login has no scope entry at all), so a route guard here would have to invent an auth mechanism speculatively, ahead of the feature that actually owns that decision. This spec covers the shell's visual and navigational structure only.

## Options considered

### Option 1: One `AppShell` component with a `variant` prop, per portal composition already fixed in design.md

A single component, `<AppShell variant="public" | "admin" | "broker">`, switches its header/sidebar/footer composition based on the variant, backed by a static nav config per variant.

**Pros**:

- Directly implements what the reverse engineering document recommends and what `design.md` already specifies; no new design decision, only build work.
- One component to maintain instead of three, so a shared fix (spacing, a new header element) lands everywhere at once instead of drifting across copies, the exact failure this feature exists to prevent.

**Cons**:

- A single component with three composition modes carries more internal branching than three separate, simpler components would.

### Option 2: Three separate shell components (`PublicShell`, `AdminShell`, `BrokerShell`)

**Pros**:

- Each component is simpler in isolation, no variant branching inside any one of them.

**Cons**:

- This is structurally the same duplication problem the reverse engineering document flags in the legacy app, just moved from Twig files to React components; a shared change (updating the header logo, adding a global banner) has to be applied three times instead of once.

## Rationale

The engineer's own directions across this feature's design conversation, and `design.md`'s already recorded composition patterns, point at Option 1 without contention: one component, one place the three layouts are defined, matching the reverse engineering document's explicit recommendation (basis: `frontend/docs/REVERSE_ENGINEERING.pdf`, section 9.4). Three separate components would reproduce the exact duplication this feature is meant to retire.

## References

**Project sources** (verifiable, in this repo):

- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 9.4 (the `<AppShell variant>` consolidation recommendation)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 8.4 (the legacy nav's permission filtering never actually worked; noted here as historical context, not solved by this pass since nav filtering by role/permission requires auth, which this spec explicitly excludes)
- `frontend/design.md` (spec 0003), the composition patterns section this feature implements
- `frontend/docs/scope/scope.md`, Feature 5 (as revised: shell and static nav only, auth descoped)
