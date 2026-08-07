# Uganda Paygate Frontend

React frontend for ICEA LION's Uganda travel insurance platform (public site, admin, broker portal). Backend is built separately by another team; see `docs/REVERSE_ENGINEERING.pdf` for the full system reference this rebuild targets.

## Stack

- **Language / Runtime**: TypeScript (strict mode), Node 24
- **Framework**: React 19, Vite 8
- **Key dependencies**: React Router v8, TanStack Query, React Hook Form + Zod, Tailwind CSS + Radix UI primitives
- **Package manager**: npm

## Build approach

**Tracer Bullet**: prove the whole pipe works end to end with one thin real thread before thickening any layer.

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Unit / component tests
npm run test:unit

# End to end tests
npm run test:e2e

# Dependency security audit (also runs in CI)
npm run audit:ci
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md` or `docs/specs/NNNN-title/` (index.md + rationale.md) for heavier decisions.

## Rules

- **Folder-by-feature**: colocate a feature's components, hooks, schemas, and tests in one folder rather than global `components/` / `hooks/` buckets. Matches how `docs/scope/scope.md` slices work feature by feature.
- **Strict types everywhere, no `any`**: `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns` are already on in `tsconfig.app.json` / `tsconfig.node.json`. Every network boundary is validated at runtime with Zod (see `src/lib/api-client.ts`); never trust an unvalidated payload, per the security baseline in spec 0001.
- **One consistent error handling pattern**: surface user-facing errors through a shared boundary/pattern, not ad hoc try/catch scattered per component. `ApiError` / `ApiValidationError` in `src/lib/api-client.ts` are the typed errors every data-fetching call throws; handle those types, don't stringify and guess.
- **Accessibility baseline, WCAG AA**: every interactive component (forms, modals, dropdowns) must be keyboard operable and screen-reader labeled. Radix UI primitives handle most of this by default; don't build a custom interactive element when a Radix primitive already covers it.
- **Auth tokens stay in memory only**: never persist an access token to `localStorage` or `sessionStorage` (spec 0001; this is the direct fix for the legacy app's worst auth bug). `setAccessToken` in `src/lib/api-client.ts` is the only place a token is held.
- **One feature at a time, in scope order**: per `docs/scope/scope.md`'s sequencing rule, a feature is built, verified, and closed before the next one's `/architect` starts. Do not open a second feature's design while an earlier one is in progress.
- **Dependency security is a gate, not a suggestion**: `npm audit --audit-level=high` must report zero before a build is considered done (wired into CI as `frontend-ci.yml`, `audit` job). A high or critical severity finding blocks merge, even if it means deviating from a previously decided package version (see spec 0001's Follow-up for the react-router v7→v8 precedent).

## Tooling

- **Lint & format**: ESLint (flat config, `eslint.config.js`) with `eslint-plugin-security` for security-aware rules on top of `typescript-eslint` and the React hooks/refresh plugins.
- **Pre-commit**: lint + format + typecheck must run before every commit. Not yet wired as an actual git hook; installing this (husky or simple-git-hooks + lint-staged, or an equivalent) is the next `/develop tooling` task.
- **Testing gate**: Vitest + React Testing Library for unit/component, Playwright for end to end (`e2e/`). Configured in `vite.config.ts` (`test` block) and `playwright.config.ts`.
- **CI**: `.github/workflows/frontend-ci.yml` runs on every push/PR touching `frontend/`: `npm audit --audit-level=high` (gates everything else), then lint + build, then unit tests, in parallel after the audit passes.
- **Dependency updates**: Dependabot (`.github/dependabot.yml`), weekly, for both the `frontend/` npm ecosystem and GitHub Actions.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
