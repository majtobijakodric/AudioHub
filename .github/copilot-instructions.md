# Project Guidelines

## Code Style
- TypeScript + ESM is required (`"type": "module"` in `package.json`).
- In TS files, keep `.js` extensions in local imports (example: `src/index.ts`, `src/routes/index.ts`).
- Keep route handlers in `src/controllers/*.ts` and routers in `src/routes/*.ts`; handlers are async and return JSON.
- Validate request bodies early and return immediately on failure (`src/controllers/auth.ts`, `src/controllers/youtube.ts`).
- Use the logger from `src/lib/logger.ts`: `logger.info('message')` and `logger.error('context', error)`. Never use raw `console.log` for application logging.

## Architecture
- Entry point is `src/index.ts`: sets CORS headers, enables JSON, serves `public/`, and mounts API under `/api`.
- Routing is layered: `src/routes/index.ts` mounts feature routers (`/auth`, `/youtube`, `/songs`), each router delegates to controller functions.
- DB access is centralized in `src/lib/prisma.ts` via one exported `prismaClient`.
- Prisma client is generated to `src/generated/prisma` from `prisma/schema.prisma`; do not hand-edit generated files.
- Downloaded audio files are stored under `data/songs/` (not in `public/`); files are named `{videoId}.opus`.
- Logging is centralized in `src/lib/logger.ts`; outputs to both console and `logs/log-{N}-{DD.MM.YYYY}-{HH.MM}.txt` (new file each server start).
- Every HTTP request is automatically logged by middleware in `src/index.ts` with method, path, status, and response time.
- Log files are stored under `logs/` and gitignored; only `.gitkeep` is tracked.

## Build and Test
- Install dependencies: `npm install`
- Run dev server: `npm start` (uses `nodemon` + `ts-node/esm` from `nodemon.json`).
- Type-check: `npx tsc --noEmit`
- Prisma after schema changes (preferred): `npx prisma migrate dev --name <change_name> && npx prisma generate`
- Fast local schema sync (no migration): `npx prisma db push && npx prisma generate`
- Manual API checks: run requests in `tests/api-tests.rest`.

## Project Conventions
- Use `createRequire(import.meta.url)` for CommonJS-only packages (`jsonwebtoken`, `yt-search`, `yt-dlp-wrap`) as shown in controllers.
- Auth flow pattern:
  - `signup`: validate -> check uniqueness -> hash password -> return safe fields only.
  - `login`: validate -> find user -> compare hash -> return `{ user, token }`.
- Keep YouTube search response shape stable (`query`, `count`, `results[]`) from `src/controllers/youtube.ts`.
- Song download flow: validate videoId -> check DB for existing record -> check file on disk -> download via yt-dlp if needed -> upsert DB record (`src/controllers/songs.ts`).
- Song dedup key is `videoId` (unique). If DB record exists but file is missing, re-download and repair.
- Add new endpoints by following the checklist in `helper.md` and mount route groups in `src/routes/index.ts`.

## Integration Points
- Database: MySQL/MariaDB through Prisma MariaDB adapter (`@prisma/adapter-mariadb`) in `src/lib/prisma.ts`.
- Secrets/config come from `.env` loaded by `src/secrets.ts`.
- Static frontend files are served directly from `public/`.
- External API dependency: YouTube search through `yt-search` in `src/controllers/youtube.ts`.
- External binary dependency: `yt-dlp` CLI (must be installed on the system); wrapped by `yt-dlp-wrap` in `src/controllers/songs.ts`.

## Security
- Required env vars: `DATABASE_URL`, `JWT_SECRET`; startup should fail fast if missing (`src/secrets.ts`).
- Never return password hashes in API responses; follow current `signup` response pattern.
- Keep password hashing with `bcrypt` and compare with `compareSync` unless refactoring auth holistically.
- JWT signing uses `JWT_SECRET`; preserve token payload compatibility (`{ userId }`) unless coordinated.
- CORS is currently permissive (`*`) in `src/index.ts`; do not tighten/alter without explicit product requirement.

## Documentation Authoring Rules
- Documentation lives in `docs/` and must be indexed from `README.md` in the **Documentation** section.
- Keep one topic per file and use lowercase names such as `setup.md` and `api.md`.
- Write docs to be beginner-friendly first: explain concepts before details, avoid jargon when possible, and define required terms on first use.
- For setup or operations steps, use numbered sequences with copy-paste-ready commands and expected outcomes.
- Prefer practical examples taken from current routes, scripts, and files in this repo.
- Use consistent structure in each doc file: purpose, prerequisites (if needed), steps/sections, verification, and related links.
- Use clear, direct language; short paragraphs; active voice; and descriptive headings.
- Keep canonical information in one place and cross-link instead of duplicating content.
- When code behavior changes, update related docs in the same change whenever feasible.
- If adding a new documentation file, add its link in `README.md` using the project’s documentation link order.
