# Frontend implementation rules

Conventions for `luneri_frontend`. The workspace `CLAUDE.md` points here; on any
conflict this file wins for frontend code.

**This repository is public.** No keys, no tokens, no internal hostnames, no
real deployment URLs — in code, in comments, or in committed config.

## The gate

`npm run gate` is the definition of "done": `prettier --check .` · `eslint` ·
`tsc --noEmit` · `vitest run`. The same checks run as pre-commit hooks, so a
commit cannot be greener than the gate.

## 1. One `createApi`; resources inject into it

`store/api/baseApi.ts` calls `createApi` once. Every resource is
`baseApi.injectEndpoints`.

A second `createApi` is a second cache, a second middleware to register, and two
invalidation graphs that can never invalidate each other — a mutation on one
resource would leave another's cache stale with no way to express the
dependency. Adding a resource must be a new file plugged into the existing seam,
never a change to the assembly.

## 2. The audience boundary is the route tree, not a conditional

Internal and user-facing pages live in different route groups with different
layouts. A page in one tree must not contain a code path that renders the
other's fields.

`{isAdmin && <SourcePath/>}` fails twice: every new internal field adds another
conditional, and a bug in any one of them leaks internal data. Separate trees
mean the user page _cannot_ render a source path, rather than being trusted not
to.

This is organisational, not a security control. Real access control lives at the
API, and a route group keeps nobody out.

## 3. `NEXT_PUBLIC_` is a publication decision

A `NEXT_PUBLIC_` value is inlined into the client bundle and readable by anyone
who loads the page. Correct for an API base URL. Never for a key, a token, or a
credential — reaching for the prefix to "make it work" publishes the secret.

## 4. Tests assert wiring, not exports

A test that proves a module exports a symbol proves what `tsc` already proved.
Test the things a type checker cannot see: that middleware is in the chain, that
a request goes to the URL you think, that a provider actually provides.

The measure of such a test is whether it can fail. Before trusting a new wiring
test, break the wiring it claims to guard and watch it go red.

## 5. Snake_case from the API stays snake_case

Wire types mirror the backend's field names exactly. Renaming at the boundary
buys nothing and creates a second shape to keep in step with a backend that will
keep changing.
