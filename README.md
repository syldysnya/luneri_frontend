# luneri_frontend

Frontend for **Luneri** — turns a long-form VOD into ready-to-post social clips.

> **This repository is public.** No keys, no prompts, no internal endpoints.
> Anything secret belongs in `luneri_backend`.

## Running it

Requires Node 22.23.0 (see `.nvmrc`) and the backend serving on
`http://localhost:8000` — from `luneri_backend`, `hatch run serve`.

```bash
npm install
pre-commit install
cp .env.example .env
npm run dev
```

`pre-commit` is a Python tool, installed separately from this repo — `pipx
install pre-commit` or `pip install pre-commit` — so `pre-commit install` fails
with `command not found` until it's on your machine.

Then open `http://localhost:3000`. A stream trace is at `/traces/<stream id>`;
get an id from `hatch run ingest <path>` in the backend.

`NEXT_PUBLIC_*` values are inlined into the client bundle at **build** time.
Setting `NEXT_PUBLIC_API_URL` after `npm run build` has no effect — the value
baked into that build stays baked in, so one build cannot serve two
environments.

## Commands

| Command         | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `npm run dev`   | Development server on port 3000.                               |
| `npm run build` | Production build. Also the check that the route tree is valid. |
| `npm run gate`  | The definition of "done": format, lint, types, tests.          |
| `npm run fmt`   | Rewrite files to the Prettier style rather than reporting.     |
| `npm test`      | Vitest, once. `npm run test:watch` to keep it running.         |

## Layout

| Path               | Holds                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| `src/app/(admin)/` | Internal UI. Will show source paths and raw values once the trace pages are built. |
| `src/app/(user)/`  | User-facing UI. A different design; not built yet.                                 |
| `src/store/`       | The Redux store and the one RTK Query API.                                         |
| `src/types/`       | Wire shapes, transcribed from the backend.                                         |
| `src/theme/`       | The MUI theme.                                                                     |
| `tests/`           | Flat, matching the backend's layout.                                               |

Conventions live in `.codex/implementation-rules.md`. Design notes and plans are
under `docs/superpowers/`.
