# 0001. Stack and architecture: rationale

## Context

The legacy PHP application this project replaces had serious, documented security failures: an auth token whose expiry was never actually checked, a signing secret committed to source control, tokens sent in URLs and request bodies instead of headers, and unsalted password hashes (see `frontend/docs/REVERSE_ENGINEERING.pdf`, section 3 and section 10). The new frontend is being built by a different team than the backend, and the backend does not exist yet. That means the frontend stack has to be decided against a documented, planned API contract (the reverse engineering document's sections 6, 12 and 13) rather than a live API, and it has to assume nothing about how carefully the backend will guard tokens; the frontend's own choices are the first and, for now, only line of defence against repeating the legacy app's mistakes.

The product itself is a three portal system, a public quote and purchase site, an admin back office, and a broker portal, sharing one design system but with very different UI density (a five step public wizard versus dense admin data tables). It will be built one module at a time, client first, and the engineer has asked for the same caliber of structure and security discipline used by large, security conscious engineering organisations, plus a small, well audited set of dependencies rather than a large surface of packages to keep patched.

## Options considered

### Option 1: A comprehensive framework bundle (Next.js style, server rendering by default)

Adopt a full stack React framework with built in routing, data loading and server rendering.

**Pros**:
- Batteries included: routing, data fetching conventions, and image or asset handling come from one project.
- Server rendering is available out of the box, which helps the public marketing style pages (SEO).

**Cons**:
- The project already has a working Vite scaffold; switching frameworks now means discarding it and re deciding hosting, build tooling and deployment all at once.
- A server rendering framework needs a Node server or edge runtime to operate, which is an operational commitment the backend team, not this frontend team, would need to own; nothing in the reverse engineering document asks for server rendering.
- Heavier and more opinionated than three portals behind a login (admin, broker) plus one public wizard actually need.

### Option 2: Vite plus a focused set of best in class libraries, chosen layer by layer

Keep the existing Vite scaffold and add React Router, TanStack Query, React Hook Form with Zod, Tailwind CSS with a headless component layer, and a thin typed fetch wrapper, each chosen independently for its layer.

**Pros**:
- Builds directly on the scaffold that already exists; no throwaway work.
- Every dependency is small, does one job, and is independently replaceable if a better option appears later, which keeps the security surface auditable.
- Matches how the reverse engineering document's own recommended React architecture (section 13) describes the rebuild: React Router, React Hook Form, a design token set, a generic data table component.

**Cons**:
- No server rendering by default; the public site's SEO needs (if any beyond what a single page app can do with metadata tags) are not solved for free, and would need a follow up decision if they turn out to matter.
- More decisions to make up front, one per layer, rather than one framework decision.

### Option 3: Minimal dependencies, hand rolled where possible

Use only React, native fetch and the browser's own form handling, avoiding third party routing, query and form libraries.

**Pros**:
- Smallest possible dependency count, in principle the smallest possible attack surface.

**Cons**:
- Hand rolled routing, cache invalidation and form validation are exactly the kind of code that quietly grows security bugs (stale auth checks, unvalidated input) precisely because there is no maintained library enforcing the pattern; the legacy PHP app's own worst bugs were hand rolled auth and validation code, not a library flaw.
- Every one of the roughly twenty planned admin screens and the five step wizard would re-solve problems React Hook Form, TanStack Query and React Router solve once, correctly, for everyone.

## Rationale

The project already has a running Vite scaffold (see `frontend/package.json`); Option 1 would throw that away to gain server rendering the product does not currently need, since every portal here sits behind a wizard or a login, not a marketing site optimised for search engines. Option 3 under-serves the engineer's own stated priority: security matters even without a live backend yet, and the legacy system's worst bugs (section 10 of the reverse engineering document: unchecked token expiry, silent auth failures, an assignment where a comparison was meant) were hand rolled logic, not library bugs. A small number of mature, actively maintained, single purpose libraries (basis: the current package landscape check confirmed React Router, TanStack Query, React Hook Form, Zod, Tailwind and the testing stack are all actively maintained with no deprecation concerns as of this writing) gives predictable, well documented behaviour for routing, caching and validation, which is easier to audit than equivalent hand rolled code, while staying far lighter than a full server rendering framework the deployment story does not call for.

## References

**Project sources** (verifiable, in this repo):
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 3 (auth as-is, security issues) and section 10 (known bugs, do not replicate)
- `frontend/docs/REVERSE_ENGINEERING.pdf`, section 13 (recommended React frontend architecture)
- `frontend/docs/scope/scope.md`, the security baseline and sequencing rule recorded in the scope header
- `frontend/package.json`, the existing Vite plus React 19 plus TypeScript scaffold

**Practices & standards**:
- OWASP guidance on browser token storage (never persist bearer tokens in `localStorage` or `sessionStorage`; prefer in memory storage with an httpOnly cookie for refresh)
- Schema validated input at every trust boundary, applied here via Zod

**Links** (web verified during the Stage (c) landscape check):
- React Router: https://reactrouter.com/
- React Router changelog: https://github.com/remix-run/react-router/blob/main/CHANGELOG.md
- TanStack Query: https://tanstack.com/query/latest/docs/blog
- Tailwind CSS v4: https://tailwindcss.com/blog/tailwindcss-v4
- Base UI vs Radix UI vs Ark UI comparison: https://www.pkgpulse.com/guides/base-ui-vs-radix-ui-vs-ark-ui-guide-for-headless-react-components-2026
- eslint-plugin-security: https://www.npmjs.com/package/eslint-plugin-security
- Dependabot vs Renovate comparison: https://www.turbostarter.dev/blog/renovate-vs-dependabot-whats-the-best-tool-to-automate-your-dependency-updates
- GitHub Dependabot docs: https://docs.github.com/en/code-security/dependabot
