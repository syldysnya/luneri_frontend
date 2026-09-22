# Frontend scaffold — design

**Status:** agreed, 2026-09-22
**Branch:** `feat/frontend-scaffold`
**Scope:** a Next.js application with a working Redux/RTK Query data layer, the
route skeleton for two audiences, and a defined quality gate. No pages.

---

## 1. Why this exists

`luneri_frontend` holds a README and a `.gitignore`. Nothing else.

The backend now serves `GET /streams/{stream_id}` — one ingested stream and the
state of every pipeline step — and publishes an OpenAPI document describing it.
Until something consumes that, the only way to look at an ingested VOD is `psql`
or a `curl`.

This task builds the thing that will consume it, and stops before the pages.
What it delivers is a _provably wired_ application: a store whose middleware is
actually in the chain, a query hook that actually builds the right URL, and a
gate that actually fails when those stop being true. The pages that render the
data are the next task.

The ordering matters and was chosen deliberately. Building the API first means
this scaffold's TypeScript types are **transcribed from a response that exists**
rather than invented against one that might. That is the correction this project
made on 2026-09-22 after noticing it had built three thousand lines of
infrastructure against a pipeline that had never run.

---

## 2. Decisions

Five decisions, each recorded with the alternative it beat.

### D1 — Next.js App Router, with the audience split in the route tree

Two audiences, two route groups:

```
src/app/
  (admin)/traces/[streamId]/      internal — shows source paths and raw values
  (user)/streams/[id]/            end users — a different UI entirely, later
```

A parenthesised folder groups routes under a shared layout without appearing in
the URL. `(admin)` gets its own `layout.tsx`, which is where authentication
lands when it arrives.

**Rejected:** Vite with a client-side router, which is lighter for a read-only
viewer and needs no `'use client'` boilerplate.

**Why.** The audience boundary belongs in the route tree, not inside components.
The alternative is one page carrying `{isAdmin && <SourcePath/>}` conditionals,
which fails twice: every new internal field adds another conditional, and a bug
in any one of them leaks internal data to users. Separate trees mean the user
page has no code path that _can_ render `source_path`.

In App Router the filesystem enforces that split. In a client-side router it is
a convention someone has to remember.

**What this does not buy.** A client-side route split is organisational, not a
security control. Anything reaching the API reads the API. This keeps the two
UIs from tangling; it keeps nobody out.

### D2 — One `createApi`, everything else injects into it

`store/api/baseApi.ts` calls `createApi` once, owning the `reducerPath`, the
base query and the full `tagTypes` list. Every resource file then calls
`baseApi.injectEndpoints`.

**Rejected:** one `createApi` per resource.

**Why.** A second `createApi` is a second cache, a second middleware to
register, and a second invalidation graph. Two resources could then never
invalidate each other — a mutation on one would leave the other's cache stale
with no way to express the dependency.

Injecting means adding a resource is a new file plugged into an existing seam,
never a change to the assembly. Core Principle A in TypeScript: a row, not a
branch.

### D3 — Types are transcribed from the live endpoint

`types/stream.ts` mirrors what `GET /streams/{stream_id}` actually returns. The
backend's `/openapi.json` documents the `200`, `404` and `422` shapes and is the
source of truth.

**Rejected:** generating types from the OpenAPI document at build time.

**Why.** Codegen is the right answer at perhaps five endpoints. At one, it adds a
generator, a build step and a committed-or-not-committed argument to save
transcribing seven fields. The moment a second endpoint lands, revisit it — the
generator's value scales with surface area and there is almost none yet.

What is _not_ acceptable is inventing the shape. The endpoint exists; read it.

### D4 — The gate is four parts, mirroring the backend

```
npm run gate  →  prettier --check .
                 eslint
                 tsc --noEmit
                 vitest run
```

**Rejected:** three parts now (format, lint, types), adding tests when there is
something to test.

**Why.** "Done" should mean the same thing in both repos. The backend's gate is
format · lint · types · test; a frontend gate missing the last one means a
frontend task is done to a weaker standard than a backend task, and nobody
remembers that in six months.

The objection — that a test runner over an empty suite passes vacuously — is
answered by D5: this scaffold has real invariants to assert, and they are exactly
the ones that break silently.

The same checks run as pre-commit hooks, so a commit cannot be greener than the
gate.

### D5 — The scaffold's tests assert wiring, not existence

Three invariants, all of which can break while `tsc` and `eslint` stay green:

1. **The store mounts `baseApi`** — its reducer at the right path, its middleware
   in the chain.
2. **`useGetStreamQuery` builds the right request.** With `fetch` stubbed,
   dispatching the initiate thunk must produce a call to
   `${baseUrl}/streams/7` and land the result in the cache.
3. **The theme resolves** and `CssBaseline` applies.

**Rejected:** smoke tests asserting that modules export what they export.

**Why (2) is the load-bearing one.** RTK Query's middleware is what turns a
dispatched query into a network call. Omit it from `configureStore` and every
hook returns `isLoading: true` forever — no error, no warning, and an application
that type-checks perfectly. A wrong `baseUrl` and a wrong endpoint path fail the
same silent way.

Dispatching the thunk against a stubbed `fetch` exercises store → middleware →
base query → endpoint URL in one assertion, with no backend running. It is the
difference between a scaffold that is wired and a scaffold that compiles.

---

## 3. Module layout

```
src/
  app/
    layout.tsx                  ReduxProvider + ThemeProvider + CssBaseline
    page.tsx                    what this app is, and where to go
    (admin)/
      layout.tsx                admin chrome; auth lands here later
      traces/[streamId]/
        layout.tsx              step nav, shared by both pages
        page.tsx                placeholder
        ingest/page.tsx         placeholder
    (user)/
      layout.tsx                user chrome, empty for now
  store/
    store.ts                    configureStore, setupListeners, RootState
    hooks.ts                    typed useAppDispatch / useAppSelector
    ReduxProvider.tsx           the 'use client' boundary
    api/baseApi.ts              createApi — the one cache
    api/streamsApi.ts           injectEndpoints → useGetStreamQuery
    api/index.ts                re-export barrel
  types/stream.ts               StreamResponse, StepResponse, StepStatus
  theme/theme.ts                the MUI theme
tests/
  store.test.ts                 invariant 1
  streamsApi.test.ts            invariant 2
  theme.test.tsx                invariant 3
```

Nothing under `src/components/` yet. The first component that exists will be one
a page needs, and that is the next task.

---

## 4. Configuration

`NEXT_PUBLIC_API_URL` names the backend, defaulting to `http://localhost:8000` —
the address `conf/api/local.yaml` binds. `.env.example` is committed with that
default; `.env` and `.env.*` are already gitignored.

**This repository is public.** A loopback address is not a secret and nothing
else belongs here. Any real deployment URL arrives through the environment, not
through a committed file.

A `NEXT_PUBLIC_` prefix means the value is inlined into the client bundle and is
readable by anyone who loads the page. That is correct for an API base URL and
would be catastrophic for anything else — no key, token or credential ever takes
that prefix.

---

## 5. Style and conventions

Prettier: tabs, no semicolons, single quotes, print width 120, `arrowParens:
avoid`, `trailingComma: none`. These match the conventions this project's backend
work already borrows from, so a reader moving between codebases is not re-reading
the same code in two dialects.

ESLint flat config with `typescript-eslint` recommended plus
`eslint-plugin-react-hooks`. `no-console` is an error — a logger module is the
exception and carries an override.

TypeScript `strict`, `noEmit`, with `@/*` resolving to `./src/*`.

Node 22.23.0, pinned in `.nvmrc`.

---

## 6. Testing

Vitest with `jsdom` and Testing Library. `tests/` at the repo root, mirroring the
backend's flat `tests/` rather than co-locating beside sources.

The three tests are named in D5. Each asserts a wiring invariant that no type
checker can see, and each fails loudly when its invariant breaks:

| Test                 | Fails when                                                                      |
| -------------------- | ------------------------------------------------------------------------------- |
| `store.test.ts`      | `baseApi.reducer` or `baseApi.middleware` is dropped from `configureStore`      |
| `streamsApi.test.ts` | the base URL is wrong, the endpoint path is wrong, or the middleware is missing |
| `theme.test.tsx`     | the theme fails to resolve or `CssBaseline` is not applied                      |

No mocking of Redux itself. The store under test is the real store.

---

## 7. Conventions to record (Rule 4)

`frontend/.codex/implementation-rules.md` is created by this change, with the
frontend's starting rules:

1. **One `createApi`; resources inject.** A second `createApi` is a second cache.
2. **The audience boundary is the route tree, not a conditional.** A page for one
   audience must not contain a code path that renders another audience's fields.
3. **`NEXT_PUBLIC_` is a publication decision.** The value is inlined into the
   client bundle. Nothing secret ever carries the prefix.
4. **Tests assert wiring, not exports.** A test that only proves a module exports
   a symbol proves what the type checker already proved.

The workspace `CLAUDE.md` Gates table gains the frontend row it currently records
as "not yet defined".

---

## 8. Out of scope

Named explicitly so the implementation plan does not drift.

- **No pages that render stream data.** `traces/[streamId]/page.tsx` and its
  `ingest` child render placeholders; building them is the next task. The one
  real page is `app/page.tsx`, a signpost so `/` is not a 404 — it names the
  application and links to the trace route. It fetches nothing.
- **No components.** `src/components/` is not created.
- **No user-facing `(user)/streams/[id]` page** — the group and its layout exist;
  the route does not.
- **No authentication.** `(admin)` is a folder, not a guard.
- **No error boundaries, loading skeletons or suspense strategy.** They belong
  with the pages that need them.
- **No E2E tests, no Playwright.** Three unit tests of wiring, nothing more.
- **No OpenAPI codegen** (D3).
- **No changes to the backend.**

---

## 9. Open, deliberately

1. **Codegen versus transcription** (D3). One endpoint does not justify a
   generator. Revisit at the second or third.
2. **Dark mode.** The theme is structured so a second palette is an addition
   rather than a rewrite, but only one is defined. No one has asked for two.
3. **Where step-status colour lives.** The status → chip mapping is a lookup
   table the pages need, so it arrives with them. Noted because the temptation
   is to put it in the theme now, before anything renders a chip.
4. **Whether `tests/` should mirror `src/`.** It is flat today, matching the
   backend. Revisit if it grows past roughly twenty files.

---

## 10. Landing

One branch, one PR (Rule 1): `feat/frontend-scaffold`, base `main`.

The change is the application skeleton, the store and its API layer, the types,
the theme, three tests, the toolchain and its gate, the pre-commit hooks,
`.codex/implementation-rules.md`, and the `CLAUDE.md` Gates row — not code alone.

`luneri_frontend` has no labels yet; this PR creates `enhancement` and
`area: scaffold`.
