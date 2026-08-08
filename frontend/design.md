---
name: uganda-paygate-design-system
source: extracted-from-code # brand tokens sourced from REVERSE_ENGINEERING.pdf section 9.1 (the legacy app's verified CSS); neutral ladder, spacing, and radius derived fresh, spec 0003
character: "Confident and institutional, a navy-and-gold insurance brand, not a startup. Trustworthy over playful: generous whitespace, one accent used sparingly for calls to action, status communicated through shape and icon as well as color."
tokens: "real values live in src/index.css (:root custom properties, wired through Tailwind's @theme); read them there, never duplicated here"
contrast: "body 9.70:1 light, ink 16.37:1 light, muted 4.62:1 light; on-primary 12.14:1, on-accent 5.70:1; on-success/on-warning use --color-primary-dark (5.46:1 / 10.50:1), on-danger uses white (4.53:1) because the primary-dark-on-danger pairing fails at 3.78:1"
---

## Build mandate

Every screen ships as a complete, professional product surface: real product specific copy, a considered layout with hierarchy, all states (empty, loading, error), and a footer where the page warrants one. This is an insurance platform handling money and travel documents; nothing ships as a bare functional widget. Full disqualifier list: the UI guide's bar (`ui-guide.md`).

## Character & direction

Institutional trust, not startup energy. The legacy app's own verified palette (deep navy `#003764`, a muted gold `#866000`) already carries this personality; the rebuild keeps it rather than reinventing a new brand. One accent (gold) is reserved for primary actions only, never decoration. Status is never color alone: a paid quote, a pending payment, and a failed contract each carry a distinct icon (Lucide) alongside their color, so the product reads correctly for a colorblind user and stays legible even before the color registers.

Density genuinely differs by portal without the underlying components forking: the public quote wizard breathes (comfortable density, generous spacing), the admin and broker screens are information dense (compact density, tighter rows) because their users are staff processing many records a day, not a customer making one purchase.

## Composition patterns

- **App shell**: one parameterized shell (scope Feature 5, not yet built) will own the header/sidebar/footer composition per portal variant (`public | admin | broker | auth`). Until then, individual demo/catalog routes set `data-portal` directly to preview each context's typography.
- **Public pages**: centered content column with real breathing room, footer present on every page, `--font-public` (Roboto).
- **Admin/broker pages**: full width layouts, denser component density by default, `--font-admin` (Source Sans Pro).
- **Forms**: labels always visible (never placeholder-as-label), errors appear inline beneath the field, associated via `aria-describedby`, never color alone.

## Component & usage rules (do's and don'ts)

- **Accent (gold) usage**: primary call-to-action buttons only (e.g. "Get a quote", "Pay now"). Never a decorative background, a hover tint on non-interactive elements, or a link color (links use `--color-primary-hover`).
- **Status colors**: never rendered as text directly on `--color-canvas` (success and warning both fail WCAG AA that way, verified during scaffolding). Always paired with their matching `--color-on-*` token, as a solid badge background or an icon fill, never a bare colored word.
- **Elevation**: hairline borders (`--color-border`) for structural dividers; `--color-border-strong` (3.08:1, WCAG AA for a form control's only visual boundary) for input/button/select outlines. No drop shadows in this pass; if a later screen needs elevation, that is a design.md amendment, not an ad hoc shadow value.
- **Spacing rhythm**: every gap is a `--space-*` token (4px base, 8px rhythm). No arbitrary pixel margin in a component.
- **Icons**: Lucide only (`lucide-react`), sized via a token (16/20/24px), decorative icons `aria-hidden="true"`, standalone interactive icons carry an `aria-label`.
- **Density**: every base component accepts `density: 'comfortable' | 'compact'`; a screen author states it explicitly, a component never infers it from its own render context.

## Responsive & accessibility direction

- WCAG AA is the floor everywhere (`AGENTS.md`), enforced concretely here: 4.5:1 minimum for body text and any text-bearing token pairing, 3:1 minimum for a form control's boundary, a visible focus ring on every interactive element reachable by `Tab`, and no interactive behavior that requires a mouse.
- Mobile first is not yet load bearing for this pass (no responsive breakpoint requirement in spec 0003); each later screen's own spec should state its responsive behavior explicitly rather than assume one.
