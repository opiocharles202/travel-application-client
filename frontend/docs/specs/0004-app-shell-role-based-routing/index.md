# 0004. App shell (public / admin / broker)

**Date**: 2026-08-08
**Status**: Accepted

## Summary

This builds one shell component, `AppShell`, that every page in the app renders inside. It has three modes: a public site look (header, page content, footer) for the customer facing quote wizard and marketing pages; and an admin/broker look (header, a sidebar with navigation, content, no footer) for the two internal portals. This replaces what the legacy app did with 8 separate, duplicated layout files. Authentication and role based route guarding are explicitly not part of this feature (the engineer's own call, since no login feature has been built yet); this shell only decides what a page looks like, not who is allowed to see it.

## Context

See `rationale.md` for the full context, options considered, and references.

## Requirements

**User stories**:

- As a frontend engineer building any page, I want to wrap it in one shell component and get the correct header/sidebar/footer for its portal, so that I never hand roll layout structure per page.
- As a customer on the public site, I want a consistent header and footer on every page, so that the site feels like one coherent product.
- As an admin or broker user, I want a sidebar with navigation to the sections of my portal, so that I can move between screens without hunting for links.

**Acceptance criteria**:

- **AC-1**: `<AppShell variant="public">` renders a header, the page's children as content, and a footer.
- **AC-2**: `<AppShell variant="admin">` and `<AppShell variant="broker">` each render a header, a sidebar containing that portal's nav, and the page's children as content; neither renders a footer.
- **AC-3**: The admin and broker variants render distinct nav content (different menu items), sourced from a typed, per-portal nav config, not inferred or guessed at render time.
- **AC-4**: Every nav item is a real link (using the app's router, not a bare anchor tag reload) with an icon from `lucide-react` and a label.
- **AC-5**: The currently active nav item (matching the current route) is visually distinguished from inactive items.
- **AC-6**: The shell uses only the design tokens and base components from spec 0003 (Button, the color/spacing tokens); no new hardcoded color or spacing value is introduced.
- **AC-7**: The sidebar (admin/broker) is keyboard navigable: every nav link is reachable by `Tab` and shows a visible focus ring, matching the accessibility bar spec 0003 already set.
- **AC-8**: On a narrow viewport, the admin/broker sidebar collapses to a toggleable menu rather than permanently consuming horizontal space (the legacy admin shell was explicitly flagged as desktop only with no responsive pattern, REVERSE_ENGINEERING.pdf section 11.7; this shell does not repeat that).

## Options considered

See `rationale.md`.

## Decision

**Chosen option**: One `AppShell` component with a `variant: 'public' | 'admin' | 'broker'` prop, switching composition per `design.md`'s already recorded patterns, backed by a static, typed nav config per portal.

No authentication, route guarding, or token handling is part of this feature. `AppShell` is purely presentational: it accepts `variant` and renders children inside the matching layout. A future auth feature (client account auth, scope feature 8, or an admin/broker login feature not yet scoped) is responsible for deciding whether a user may reach a given route at all; this shell has no opinion on that.

## Feature design

**Data model sketch**: no persisted data. One in-memory config shape:

```
NavItem = { label: string, href: string, icon: LucideIcon }
NavConfig = { admin: NavItem[], broker: NavItem[] }
```

Sourced from the reverse engineering document's documented sitemap (section 8.2 admin pages, section 8.3 broker pages), trimmed to what's actually buildable given the current scope (only nav items pointing at features already scoped get a real `href`; a documented-but-unscoped page is either omitted or noted as a Follow-up, never linked to a route that doesn't exist).

**State transitions**: none.

**API surface**: none; this feature makes no network calls.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Render the admin/broker sidebar | which nav items appear | the static `NavConfig` for that variant, not a runtime decision |
| Highlight the active nav item | which item is "active" | the current route, read from the router (React Router's `useLocation`/`NavLink` active matching), never a manually tracked boolean |

**Key invariants**:

- `AppShell` never fetches data itself; it is a pure layout component driven entirely by its `variant` prop and its `children`.
- The public variant never renders a sidebar; the admin/broker variants never render a footer. These are structural, not configurable per instance.

**Security model**: not applicable. This feature introduces no data access and, per the engineer's explicit descope, no authentication or authorization logic. The one relevant constraint carried from the project's baseline: no `dangerouslySetInnerHTML` anywhere in the shell.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: rendering `<AppShell variant="admin">` with children shows a header, a sidebar with the admin nav items, the children, and no footer, verifies **AC-2, AC-3**.
- Happy path: rendering `<AppShell variant="public">` shows a header, children, and a footer, and no sidebar, verifies **AC-1**.
- Accessibility: every sidebar nav link is reachable by `Tab` with a visible focus ring, verifies **AC-7**.
- Responsive: at a narrow viewport width, the sidebar is not permanently visible and a toggle reveals it, verifies **AC-8**.

## Build plan

1. Define the `NavItem`/`NavConfig` types and the static admin/broker nav configs (from the reverse engineering document's documented sitemap, trimmed to scoped features), satisfies **AC-3**.
2. Build the public variant: header, content slot, footer, using spec 0003 tokens and components, satisfies **AC-1, AC-6**.
3. Build the admin/broker shared chrome: header, collapsible sidebar shell, content slot, no footer, satisfies **AC-2, AC-6**.
4. Wire the sidebar to render the variant's `NavConfig`, each item as a real router link with a Lucide icon, satisfies **AC-3, AC-4**.
5. Wire active-route highlighting on nav items using the router's location, satisfies **AC-5**.
6. Add the responsive sidebar collapse/toggle behavior for narrow viewports, satisfies **AC-8**.
7. Verify keyboard operability and focus visibility across every nav link, satisfies **AC-7**.
8. Write tests: variant composition (public vs admin vs broker), nav rendering per portal, active-item highlighting, keyboard reachability, and a narrow-viewport collapse check.

All 8 tasks built. Code in `src/components/shell/`. Wired into `src/App.tsx` (public `/`, plus placeholder `/admin` and `/broker` routes proving the shell wraps real routes; the actual admin/broker screens are scope features 12-21, not built here). 79/79 tests passing (`npm run test:unit`); typecheck, lint, build, and the e2e smoke test all clean. Verified live in a real browser: all 3 variants screenshotted, the narrow-viewport sidebar collapse/toggle exercised end to end, and keyboard Tab traversal through every nav link confirmed with a visible focus ring.

## Consequences

**Positive**:

- Every later page (the quote wizard, ~15 admin screens, the broker portal) wraps in one shell instead of hand rolling layout, directly retiring the legacy app's 8 duplicate layout files.
- The nav config being typed and centralized means adding a new admin screen's nav entry is a one line config change, not a template edit.

**Negative / tradeoffs**:

- Because auth is explicitly out of scope, `AppShell` alone does not protect `/admin` or `/broker` routes from an unauthenticated visitor; anyone can currently navigate there and see the shell (though not real data, since no feature fetches any yet). This is an accepted, temporary gap the engineer chose, not an oversight, and is called out explicitly in Follow-up.
- The static nav config duplicates some of scope's own feature list; if a scoped feature's route changes, the nav config needs a matching update, a manual sync point rather than something derived automatically.

**Neutral**:

- Fine-grained permission based nav filtering (per the legacy app's dead RBAC ambition, section 8.4) is not attempted here; the nav shows every item for a portal, unconditionally, until a real permissions system exists.

## Follow-up

- [ ] **Load bearing, not optional**: before any admin or broker route in this shell is exposed in a real deployment, a route guard must exist. Track this against whichever feature ends up owning admin/broker login (not yet scoped) and client account auth (scope feature 8); `/architect` should treat "gate `/admin` and `/broker` by role" as its own decision when that feature is designed, not assume this spec already solved it.
- [ ] When scope feature 8 (client account auth) is built, decide whether the public `AppShell` variant needs an authenticated sub-state (e.g. showing "My purchases" vs "Sign in" in the header) or whether that's a separate concern layered on top.
- [ ] Nav items pointing at not-yet-scoped admin/broker pages (if any were trimmed from the reverse engineering document's documented sitemap) should be revisited as those features get scoped.

## Rationale

Reasoning, options considered, and references: see `rationale.md`.
