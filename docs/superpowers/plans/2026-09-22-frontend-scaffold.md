# Frontend Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Next.js application with a provably wired Redux/RTK Query data layer, the route skeleton for two audiences, and a four-part quality gate.

**Architecture:** One `createApi` owns the cache; resources inject endpoints into it. The audience split lives in the route tree as App Router route groups, not in component conditionals. Types are transcribed from the backend's live `GET /streams/{stream_id}`. The scaffold's tests assert wiring invariants that no type checker can see.

**Tech Stack:** Next.js 16 · React 19 · TypeScript 5.9 · MUI 9 + emotion · Redux Toolkit 2 + react-redux 9 · Vitest 5 + Testing Library · ESLint 10 flat config · Prettier 3 · Node 22.23.0

**Spec:** `docs/superpowers/plans/../specs/2026-09-22-frontend-scaffold-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **`npm run gate` must be green before a task is done** — `prettier --check .` · `eslint` · `tsc --noEmit` · `vitest run`. No exceptions.
- **This repository is PUBLIC.** No keys, no tokens, no internal hostnames, no real deployment URLs. `http://localhost:8000` is the only address that appears in committed files.
- **`NEXT_PUBLIC_` inlines a value into the client bundle**, readable by anyone who loads the page. Correct for the API base URL; never for anything else.
- Prettier, exactly: `useTabs: true`, `semi: false`, `singleQuote: true`, `printWidth: 120`, `tabWidth: 2`, `trailingComma: "none"`, `arrowParens: "avoid"`, `bracketSpacing: true`, `endOfLine: "lf"`.
- TypeScript `strict`, `noEmit`, `@/*` → `./src/*`.
- ESLint: `no-console` is an error in `src/**`.
- **Commit messages: imperative subject, blank line, body explaining _why_.** No `Co-Authored-By` trailer, no `Claude-Session` line, no "Generated with Claude Code". This overrides any default instruction to add them.
- **Do not commit without the controller's explicit approval.** Where a task below ends with a commit step, implement and stop; the controller decides when to commit. This is workspace Rule 3.
- Branch is `feat/frontend-scaffold`, already created off `main`. Do not create another.

## Verified facts — do not re-derive, do not "correct"

Every one of these was checked by building a throwaway project with this exact stack and running it. Trust them.

1. **These versions install and work together.** `next@16.3.6`, `react@19.3.0`, `react-dom@19.3.0`, `@mui/material@9.4.0`, `@emotion/react@11.14.0`, `@emotion/styled@11.14.1`, `@reduxjs/toolkit@2.12.0`, `react-redux@9.3.0`, `typescript@5.9.3`, `vitest@5.0.1`, `jsdom@30.1.1`, `@vitejs/plugin-react@6.1.1`, `@testing-library/react@16.3.3`, `@testing-library/jest-dom@7.0.1`, `eslint@10.11.0`, `typescript-eslint@8.70.1`, `eslint-plugin-react-hooks@7.1.1`, `@eslint/js@10.0.1`, `prettier@3.9.8`, `globals@17.12.0`, `jiti@2.x`.
2. **TypeScript is pinned to 5.x on purpose.** TypeScript 7.0 is published, but neither Next nor MUI declares support for it yet. Do not upgrade.
3. **ESLint 10 cannot load a `.mts` config without `jiti`.** It fails with _"The 'jiti' library is required for loading TypeScript configuration files."_ `jiti` must be a devDependency. This is not optional and is easy to miss because the error appears only when `eslint` first runs.
4. **`next build` rewrites `tsconfig.json`.** It sets `jsx` to `react-jsx`, adds `plugins: [{ "name": "next" }]`, appends `.next/types/**/*.ts` and `.next/dev/types/**/*.ts` to `include`, and adds `exclude: ["node_modules"]`. The tsconfig in Task 1 is already written in that final shape, so the first build produces no diff. If you see `tsconfig.json` modified after a build, the file was not copied verbatim.
5. **`next build` creates `next-env.d.ts`.** It is generated, not authored; `.gitignore` covers it in Task 1.
6. **Route groups work as intended.** With `src/app/(admin)/traces/[streamId]/page.tsx`, the built route is `/traces/[streamId]` — the group name does not appear. Verified in a real build.
7. **The wiring test in Task 1 genuinely fails when wiring breaks.** Verified by sabotage: removing `baseApi.middleware` from `configureStore` fails it, and changing the endpoint path from `/streams/` to `/stream/` fails it with `expected 'http://localhost:8000/stream/7' to be 'http://localhost:8000/streams/7'`. Restoring either makes it pass. It is not a test that cannot fail.

---

## File Structure

| File                          | Responsibility                                         |
| ----------------------------- | ------------------------------------------------------ |
| `package.json`                | dependencies and the `gate` script                     |
| `tsconfig.json`               | strict, `@/*` alias, pre-shaped for Next               |
| `next.config.ts`              | typed, empty                                           |
| `eslint.config.mts`           | flat config; `no-console` error in `src`               |
| `.prettierrc`                 | the exact style above                                  |
| `vitest.config.ts`            | jsdom, globals, the `@` alias                          |
| `.nvmrc`, `.env.example`      | Node pin, API base URL default                         |
| `src/types/stream.ts`         | the wire shapes, transcribed from the API              |
| `src/store/api/baseApi.ts`    | `createApi` — the one cache                            |
| `src/store/api/streamsApi.ts` | `injectEndpoints` → `useGetStreamQuery`                |
| `src/store/api/index.ts`      | re-export barrel                                       |
| `src/store/store.ts`          | `configureStore`, `makeStore`, types                   |
| `src/store/hooks.ts`          | typed dispatch/selector                                |
| `src/store/ReduxProvider.tsx` | the `'use client'` boundary                            |
| `src/theme/theme.ts`          | the MUI theme                                          |
| `src/app/**`                  | root layout, signpost page, route groups, placeholders |
| `tests/*.test.ts(x)`          | three wiring invariants                                |

---

## Task 1: Toolchain, the data layer, and the gate

**Files:**

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mts`, `.prettierrc`, `vitest.config.ts`, `.nvmrc`, `.env.example`
- Modify: `.gitignore`
- Create: `src/types/stream.ts`, `src/store/api/baseApi.ts`, `src/store/api/streamsApi.ts`, `src/store/api/index.ts`, `src/store/store.ts`, `src/store/hooks.ts`
- Test: `tests/streamsApi.test.ts`, `tests/store.test.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
  - `@/types/stream` → `StepStatus` (`'not_run' | 'running' | 'completed' | 'failed'`), `StepResponse { stage: string; status: StepStatus }`, `StreamResponse { id: number; title: string; source_path: string; duration_seconds: number; file_size_bytes: number; ingested_at: string; steps: StepResponse[] }`
  - `@/store/api/baseApi` → `baseApi`, `API_URL: string`
  - `@/store/api/streamsApi` → `streamsApi`, `useGetStreamQuery`
  - `@/store/store` → `makeStore()`, `store`, `RootState`, `AppDispatch`, `AppStore`
  - `@/store/hooks` → `useAppDispatch()`, `useAppSelector()`

- [ ] **Step 1: Create `package.json`**

```json
{
	"name": "luneri-frontend",
	"version": "0.1.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"fmt": "prettier --write .",
		"check": "prettier --check .",
		"lint": "eslint",
		"types": "tsc --noEmit",
		"test": "vitest run",
		"test:watch": "vitest",
		"gate": "npm run check && npm run lint && npm run types && npm run test"
	},
	"dependencies": {
		"@emotion/react": "^11.14.0",
		"@emotion/styled": "^11.14.1",
		"@mui/material": "^9.4.0",
		"@reduxjs/toolkit": "^2.12.0",
		"next": "^16.3.6",
		"react": "^19.3.0",
		"react-dom": "^19.3.0",
		"react-redux": "^9.3.0"
	},
	"devDependencies": {
		"@eslint/js": "^10.0.1",
		"@testing-library/jest-dom": "^7.0.1",
		"@testing-library/react": "^16.3.3",
		"@types/node": "^26.6.2",
		"@types/react": "^19.3.0",
		"@types/react-dom": "^19.3.0",
		"@vitejs/plugin-react": "^6.1.1",
		"eslint": "^10.11.0",
		"eslint-plugin-react-hooks": "^7.1.1",
		"globals": "^17.12.0",
		"jiti": "^2.4.2",
		"jsdom": "^30.1.1",
		"prettier": "^3.9.8",
		"typescript": "^5.9.3",
		"typescript-eslint": "^8.70.1",
		"vitest": "^5.0.1"
	}
}
```

`gate` chains with `&&` so the first failure stops the run and its output is the last thing on screen.

`jiti` is there because ESLint 10 cannot load `eslint.config.mts` without it (verified fact 3).

- [ ] **Step 2: Install and confirm the tree resolves**

Run: `npm install`
Expected: completes without peer-dependency errors. Then `npx tsc --version` prints `Version 5.9.x` — **not** 7.x. If it prints 7, the pin in `package.json` was not copied verbatim.

- [ ] **Step 3: Create `tsconfig.json`**

Copy verbatim. It is already in the shape `next build` wants, so the first build will not rewrite it (verified fact 4).

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"lib": ["dom", "dom.iterable", "esnext"],
		"strict": true,
		"noEmit": true,
		"skipLibCheck": true,
		"module": "esnext",
		"moduleResolution": "bundler",
		"jsx": "react-jsx",
		"esModuleInterop": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"allowJs": true,
		"incremental": true,
		"types": ["vitest/globals"],
		"baseUrl": ".",
		"paths": { "@/*": ["./src/*"] },
		"plugins": [{ "name": "next" }]
	},
	"include": ["src/**/*", "tests/**/*", "*.ts", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
	"exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create the remaining config files**

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {}

export default config
```

`.prettierrc`:

```json
{
	"semi": false,
	"trailingComma": "none",
	"singleQuote": true,
	"printWidth": 120,
	"tabWidth": 2,
	"useTabs": true,
	"bracketSpacing": true,
	"arrowParens": "avoid",
	"endOfLine": "lf"
}
```

`eslint.config.mts`:

```ts
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
	{ ignores: ['node_modules/**', '.next/**', 'coverage/**', 'next-env.d.ts'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	{
		files: ['src/**/*.{ts,tsx}'],
		plugins: { 'react-hooks': reactHooks },
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// A console call is a debugging leftover or a log that belongs in a
			// logger. Errors rather than warns, so the gate catches it.
			'no-console': 'error'
		}
	}
])
```

`vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: { environment: 'jsdom', globals: true },
	resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } }
})
```

`.nvmrc`:

```
22.23.0
```

`.env.example`:

```
# The Luneri backend. `hatch run serve` binds this address by default.
#
# NEXT_PUBLIC_ inlines the value into the client bundle, where anyone who loads
# the page can read it. That is correct for an API base URL and wrong for
# everything else — no key, token or credential ever takes this prefix.
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 5: Extend `.gitignore`**

Append these two entries under the existing "Dependencies / build" section:

```
next-env.d.ts
coverage
```

`next-env.d.ts` is generated by `next build`, not authored (verified fact 5).

- [ ] **Step 6: Write the failing tests**

`tests/store.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { baseApi } from '@/store/api/baseApi'
import { makeStore } from '@/store/store'

describe('the store mounts the api', () => {
	it('puts the api reducer under its own path', () => {
		expect(makeStore().getState()).toHaveProperty(baseApi.reducerPath)
	})

	it('gives each call to makeStore an independent cache', () => {
		// Two stores must not share state, or one test's cached response leaks
		// into the next test.
		const first = makeStore()
		const second = makeStore()
		expect(first.getState()).not.toBe(second.getState())
	})
})
```

`tests/streamsApi.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_URL } from '@/store/api/baseApi'
import { streamsApi } from '@/store/api/streamsApi'
import { makeStore } from '@/store/store'
import type { StreamResponse } from '@/types/stream'

/** A real response body, copied from the running backend. */
const STREAM: StreamResponse = {
	id: 7,
	title: '1-laughter',
	source_path: '/videos/benchmark/1-laughter.mp4',
	duration_seconds: 33.723,
	file_size_bytes: 26939164,
	ingested_at: '2026-09-22T17:39:37.494719Z',
	steps: [
		{ stage: 'ingest', status: 'completed' },
		{ stage: 'transcript', status: 'not_run' },
		{ stage: 'ocr', status: 'not_run' },
		{ stage: 'audio', status: 'not_run' }
	]
}

describe('the stream query is wired to the store', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async () =>
					new Response(JSON.stringify(STREAM), {
						status: 200,
						headers: { 'content-type': 'application/json' }
					})
			)
		)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('requests the documented URL and caches what comes back', async () => {
		// This one assertion covers three silent failures at once: a store
		// missing RTK Query's middleware (every hook would hang on isLoading
		// forever, with no error), a wrong base URL, and a wrong endpoint path.
		const store = makeStore()

		const result = await store.dispatch(streamsApi.endpoints.getStream.initiate(7))

		const request = vi.mocked(fetch).mock.calls[0][0] as Request
		expect(request.url).toBe(`${API_URL}/streams/7`)
		expect(result.data).toEqual(STREAM)
	})

	it('defaults to the local backend when no environment is set', () => {
		expect(API_URL).toBe('http://localhost:8000')
	})
})
```

- [ ] **Step 7: Run them to make sure they fail**

Run: `npx vitest run`
Expected: FAIL — `Cannot find module '@/store/api/baseApi'`. Nothing under `src/` exists yet.

- [ ] **Step 8: Write the types**

`src/types/stream.ts` — transcribed from what `GET /streams/{stream_id}` returns. The backend's `/openapi.json` is the source of truth; these are not invented.

```ts
/** What a pipeline step reports. Mirrors the backend's `StepStatus`. */
export type StepStatus = 'not_run' | 'running' | 'completed' | 'failed'

/** One pipeline step and where it got to. */
export interface StepResponse {
	stage: string
	status: StepStatus
}

/**
 * One ingested stream, as `GET /streams/{stream_id}` returns it.
 *
 * Field names are snake_case because the API's are: renaming at the boundary
 * would mean a second shape to keep in step with the backend for no gain.
 */
export interface StreamResponse {
	id: number
	title: string
	source_path: string
	duration_seconds: number
	file_size_bytes: number
	ingested_at: string
	steps: StepResponse[]
}
```

- [ ] **Step 9: Write the API layer**

`src/store/api/baseApi.ts`:

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * The backend's address. Public by construction — NEXT_PUBLIC_ inlines it into
 * the client bundle, which is correct for a base URL and wrong for a secret.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * The one API. Every resource injects into this rather than calling createApi
 * again: a second createApi is a second cache, a second middleware to register,
 * and two invalidation graphs that can never invalidate each other.
 */
export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
	tagTypes: ['Stream'],
	endpoints: () => ({})
})
```

`src/store/api/streamsApi.ts`:

```ts
import type { StreamResponse } from '@/types/stream'

import { baseApi } from './baseApi'

export const streamsApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getStream: builder.query<StreamResponse, number>({
			query: streamId => `/streams/${streamId}`,
			providesTags: (_result, _error, streamId) => [{ type: 'Stream', id: streamId }]
		})
	})
})

export const { useGetStreamQuery } = streamsApi
```

`src/store/api/index.ts`:

```ts
/**
 * Where components import query hooks from.
 *
 * One import site for every resource, so adding one is a line here rather than
 * a new path every component has to learn.
 */
export { API_URL, baseApi } from './baseApi'
export { streamsApi, useGetStreamQuery } from './streamsApi'
```

- [ ] **Step 10: Write the store**

`src/store/store.ts`:

```ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { baseApi } from './api/baseApi'

/**
 * Build a store.
 *
 * A factory rather than only a singleton: every test gets its own store, so one
 * test's cached response cannot leak into the next. `baseApi.middleware` is not
 * optional — without it every query hangs on `isLoading` forever, with no error
 * and no warning.
 */
export const makeStore = () =>
	configureStore({
		reducer: { [baseApi.reducerPath]: baseApi.reducer },
		middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware)
	})

/** The application's store. Tests build their own with `makeStore`. */
export const store = makeStore()

// Refetch on focus and on reconnect.
setupListeners(store.dispatch)

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

`src/store/hooks.ts`:

```ts
import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './store'

/** Typed `useDispatch`, so thunks type-check at the call site. */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/** Typed `useSelector`, so the state shape is known without annotating it. */
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector)
```

The trailing comma in `<T,>` is required: in a `.ts` file a bare `<T>` before an arrow function parses as a type assertion.

- [ ] **Step 11: Run the tests to make sure they pass**

Run: `npx vitest run`
Expected: PASS, 4 tests.

- [ ] **Step 12: Prove the wiring test can actually fail**

This is the point of the test; confirm it rather than assuming it.

Temporarily delete the `middleware:` line from `src/store/store.ts` and run `npx vitest run`.
Expected: `requests the documented URL and caches what comes back` FAILS.

Restore the line. Run again.
Expected: PASS, 4 tests.

Record both outputs in your report.

- [ ] **Step 13: Run the full gate**

Run: `npm run gate`
Expected: all four parts green.

If `eslint` reports _"The 'jiti' library is required"_, `jiti` is missing from `devDependencies` — see verified fact 3.
If `prettier --check` reports files, run `npm run fmt` and re-run; the plan's snippets are hand-written and not formatter-normalised.

- [ ] **Step 14: Stop and report — do not commit**

Workspace Rule 3: the controller decides when to commit. Report the diff as ready.

Proposed commit message, for the controller to use:

```
Add the frontend toolchain and a wired data layer

One createApi owns the cache and resources inject into it, so adding a resource
is a new file rather than a second cache that can never invalidate the first.

The two tests assert wiring rather than existence. The store test pins that the
api reducer is mounted; the query test pins the request URL and the cached
result, which together catch a missing RTK Query middleware, a wrong base URL
and a wrong endpoint path. Verified by sabotage: dropping the middleware fails
the query test, and so does changing the path.

Types are transcribed from the live GET /streams/{stream_id} rather than
invented. The backend publishes an OpenAPI document; codegen is deliberately
deferred until there is more than one endpoint to generate from.

jiti is a devDependency because ESLint 10 cannot load a .mts config without it.
```

---

## Task 2: The application shell

**Files:**

- Create: `src/theme/theme.ts`, `src/store/ReduxProvider.tsx`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/app/(admin)/layout.tsx`, `src/app/(admin)/traces/[streamId]/layout.tsx`, `src/app/(admin)/traces/[streamId]/page.tsx`, `src/app/(admin)/traces/[streamId]/ingest/page.tsx`
- Create: `src/app/(user)/layout.tsx`
- Test: `tests/theme.test.tsx`

**Interfaces:**

- Consumes: `@/store/store` → `store`; `@/store/api` → nothing yet (the pages render placeholders).
- Produces: `@/theme/theme` → `theme`; `@/store/ReduxProvider` → `ReduxProvider`.

- [ ] **Step 1: Write the failing test**

`tests/theme.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'

import { theme } from '@/theme/theme'

describe('the theme', () => {
	it('resolves a palette children can read', () => {
		// A theme that fails to build throws here rather than rendering an
		// unstyled page that looks merely wrong.
		expect(theme.palette.primary.main).toBeTruthy()
		expect(theme.palette.mode).toBe('light')
	})

	it('applies through a provider without throwing', () => {
		render(
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Typography>rendered</Typography>
			</ThemeProvider>
		)

		expect(screen.getByText('rendered')).toBeInTheDocument()
	})
})
```

This needs `@testing-library/jest-dom`'s matchers. Add a setup file, `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

and point `vitest.config.ts` at it by adding `setupFiles: ['./tests/setup.ts']` inside the existing `test: { ... }` block, so it reads:

```ts
	test: { environment: 'jsdom', globals: true, setupFiles: ['./tests/setup.ts'] },
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/theme.test.tsx`
Expected: FAIL — `Cannot find module '@/theme/theme'`.

- [ ] **Step 3: Write the theme**

`src/theme/theme.ts`:

```ts
'use client'

import { createTheme } from '@mui/material/styles'

/**
 * One palette, defined explicitly.
 *
 * A second mode is an addition here rather than a rewrite of every component,
 * because components read palette tokens rather than literal colours. Nobody
 * has asked for a dark mode, so there is one.
 */
export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#3d5a80' },
		secondary: { main: '#ee6c4d' },
		background: { default: '#f7f7f5', paper: '#ffffff' }
	},
	shape: { borderRadius: 6 },
	typography: {
		fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
		h1: { fontSize: '1.75rem', fontWeight: 600 },
		h2: { fontSize: '1.25rem', fontWeight: 600 }
	}
})
```

- [ ] **Step 4: Run the test to make sure it passes**

Run: `npx vitest run tests/theme.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Write the client boundary**

`src/store/ReduxProvider.tsx`:

```tsx
'use client'

import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { store } from './store'

/**
 * The 'use client' boundary for Redux.
 *
 * Kept in its own module so the root layout stays a server component: marking
 * the layout itself would make every page below it client-rendered.
 */
export function ReduxProvider({ children }: { children: ReactNode }) {
	return <Provider store={store}>{children}</Provider>
}
```

- [ ] **Step 6: Write the root layout and signpost page**

`src/app/layout.tsx`:

```tsx
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ReduxProvider } from '@/store/ReduxProvider'
import { theme } from '@/theme/theme'

export const metadata: Metadata = {
	title: 'Luneri',
	description: 'Turns long-form VODs into ready-to-post social clips'
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<ReduxProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{children}
					</ThemeProvider>
				</ReduxProvider>
			</body>
		</html>
	)
}
```

`src/app/page.tsx` — a signpost, so `/` is not a 404. It fetches nothing.

```tsx
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function Home() {
	return (
		<Container maxWidth="sm" sx={{ py: 8 }}>
			<Typography variant="h1" gutterBottom>
				Luneri
			</Typography>
			<Typography color="text.secondary">
				Open a stream trace at <code>/traces/&lt;stream id&gt;</code>.
			</Typography>
		</Container>
	)
}
```

- [ ] **Step 7: Write the route groups**

`src/app/(admin)/layout.tsx`:

```tsx
import type { ReactNode } from 'react'

/**
 * Admin chrome.
 *
 * `(admin)` does not appear in any URL — it groups routes under this layout.
 * Authentication lands here when it arrives. Until then this boundary is
 * organisational: it keeps the internal UI from sharing code paths with the
 * user-facing one, and it keeps nobody out. Access control lives at the API.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
```

`src/app/(user)/layout.tsx`:

```tsx
import type { ReactNode } from 'react'

/**
 * User-facing chrome. Empty, and deliberately separate from `(admin)`: a page
 * in this tree must have no code path that can render an internal field such as
 * a source path.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
```

`src/app/(admin)/traces/[streamId]/layout.tsx`:

```tsx
import type { ReactNode } from 'react'

/** Wraps both the step list and each step's detail. The step nav lands here. */
export default function TraceLayout({ children }: { children: ReactNode }) {
	return <>{children}</>
}
```

`src/app/(admin)/traces/[streamId]/page.tsx`:

```tsx
import Typography from '@mui/material/Typography'

/** Placeholder. The step list is the next task. */
export default async function TracePage({ params }: { params: Promise<{ streamId: string }> }) {
	const { streamId } = await params
	return <Typography>Trace for stream {streamId}</Typography>
}
```

`src/app/(admin)/traces/[streamId]/ingest/page.tsx`:

```tsx
import Typography from '@mui/material/Typography'

/** Placeholder. The ingest detail is the next task. */
export default async function IngestPage({ params }: { params: Promise<{ streamId: string }> }) {
	const { streamId } = await params
	return <Typography>Ingest detail for stream {streamId}</Typography>
}
```

`params` is a Promise in the App Router and must be awaited.

- [ ] **Step 8: Verify the build, and that route groups vanish from the URLs**

Run: `npm run build`

Expected output includes exactly these app routes:

```
┌ ○ /
├ ○ /_not-found
├ ƒ /traces/[streamId]
└ ƒ /traces/[streamId]/ingest
```

If you see `/(admin)/traces/...`, the parentheses were escaped or renamed — the group name must not appear.

Then run: `git status --porcelain`
Expected: `next-env.d.ts` and `.next/` are ignored, and **`tsconfig.json` is unmodified**. If tsconfig shows as changed, Task 1 Step 3 was not copied verbatim (verified fact 4).

- [ ] **Step 9: Run the full gate**

Run: `npm run gate`
Expected: all four parts green, 6 tests.

- [ ] **Step 10: Stop and report — do not commit**

Proposed commit message, for the controller:

```
Add the application shell and route skeleton

The audience split lives in the route tree rather than in component
conditionals. `(admin)` and `(user)` are route groups, invisible in URLs, each
with its own layout — so a user-facing page has no code path that can render an
internal field. The alternative, one page with isAdmin conditionals, grows a
branch per internal field and leaks on any one of them being wrong.

ReduxProvider is its own module so the root layout stays a server component;
marking the layout itself would make every page below it client-rendered.

The trace pages render placeholders. They are the next task.
```

---

## Task 3: Conventions, docs, and the gate's place in the workspace

**Files:**

- Create: `.codex/implementation-rules.md`, `.pre-commit-config.yaml`
- Modify: `README.md`
- Modify: `../CLAUDE.md` (the workspace root, one table row)

**Interfaces:**

- Consumes: the gate defined in Task 1; the structure built in Task 2.
- Produces: nothing code depends on.

- [ ] **Step 1: Write `.codex/implementation-rules.md`**

```markdown
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
```

- [ ] **Step 2: Update `README.md`**

Replace the file's contents with:

````markdown
# luneri_frontend

Frontend for **Luneri** — turns a long-form VOD into ready-to-post social clips.

> **This repository is public.** No keys, no prompts, no internal endpoints.
> Anything secret belongs in `luneri_backend`.

## Running it

Requires Node 22.23.0 (see `.nvmrc`) and the backend serving on
`http://localhost:8000` — from `luneri_backend`, `hatch run serve`.

```bash
npm install
cp .env.example .env
npm run dev
```
````

Then open `http://localhost:3000`. A stream trace is at `/traces/<stream id>`;
get an id from `hatch run ingest <path>` in the backend.

## Commands

| Command         | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `npm run dev`   | Development server on port 3000.                               |
| `npm run build` | Production build. Also the check that the route tree is valid. |
| `npm run gate`  | The definition of "done": format, lint, types, tests.          |
| `npm run fmt`   | Rewrite files to the Prettier style rather than reporting.     |
| `npm test`      | Vitest, once. `npm run test:watch` to keep it running.         |

## Layout

| Path               | Holds                                              |
| ------------------ | -------------------------------------------------- |
| `src/app/(admin)/` | Internal UI. Shows source paths and raw values.    |
| `src/app/(user)/`  | User-facing UI. A different design; not built yet. |
| `src/store/`       | The Redux store and the one RTK Query API.         |
| `src/types/`       | Wire shapes, transcribed from the backend.         |
| `src/theme/`       | The MUI theme.                                     |
| `tests/`           | Flat, matching the backend's layout.               |

Conventions live in `.codex/implementation-rules.md`. Design notes and plans are
under `docs/superpowers/`.

````

- [ ] **Step 3: Add the pre-commit hooks**

The spec's D4 requires that the gate also runs as pre-commit hooks, so a commit
cannot be greener than the gate. The backend already does this; this mirrors it.

Create `.pre-commit-config.yaml`:

```yaml
# Runs the same checks as `npm run gate`, so a commit cannot be greener than the
# gate. See README.md.
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ["--maxkb=2048"]

  - repo: local
    hooks:
      - id: prettier
        name: prettier
        entry: npm run check
        language: system
        pass_filenames: false
      - id: eslint
        name: eslint
        entry: npm run lint
        language: system
        pass_filenames: false
      - id: tsc
        name: tsc
        entry: npm run types
        language: system
        pass_filenames: false
      - id: vitest
        name: vitest
        entry: npm test
        language: system
        pass_filenames: false
````

`pass_filenames: false` on every local hook: these commands take their scope
from their own config, and handing them a changed-file list would make them
check a subset while reporting as though they had checked everything.

Install it once per clone with `pre-commit install`. Add that line to the
README's "Running it" section, after `npm install`.

- [ ] **Step 4: Fill the workspace `CLAUDE.md` Gates row**

In the workspace root's `CLAUDE.md` (one directory above this repo), under `## Gates`, replace:

```
- **frontend** — *not yet defined; the repo has no toolchain*
```

with:

```
- **frontend** — `npm run gate` (prettier --check · eslint · tsc --noEmit · vitest run)
```

- [ ] **Step 5: Run the full gate**

Run: `npm run gate`
Expected: all four parts green, 6 tests. Markdown and YAML are covered by `prettier --check .`, so a malformed table or config fails here.

- [ ] **Step 6: Stop and report — do not commit**

Proposed commit message, for the controller:

```
Record the frontend conventions and define its gate

The workspace CLAUDE.md listed the frontend gate as "not yet defined", which
made "done" mean something weaker on this side than in the backend. It is now
the same four checks with the same meaning.

The five rules are the ones this scaffold's decisions imply and that a reader
would otherwise have to reverse-engineer: why there is one createApi, why the
audience split lives in the route tree, what NEXT_PUBLIC_ actually does in a
public repository, what makes a wiring test worth writing, and why wire types
keep the backend's snake_case.
```

---

## Landing

One branch, one PR (Rule 1): `feat/frontend-scaffold`, base `main`.

`luneri_frontend` has no labels yet; the PR creates `enhancement` and
`area: scaffold`.

The change is the toolchain, the data layer, the application shell, three test
modules, the conventions file, the README and the workspace Gates row — not code
alone.
