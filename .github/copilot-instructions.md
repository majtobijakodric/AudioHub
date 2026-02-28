# Project Guidelines

## Code Style
- TypeScript + ESM is required (`"type": "module"` in `package.json`).
- In TS files, keep `.js` extensions in local imports (example: `src/index.ts`, `src/routes/index.ts`).
- Keep route handlers in `src/controllers/*.ts` and routers in `src/routes/*.ts`; handlers are async and return JSON.
- Validate request bodies early and return immediately on failure (`src/controllers/auth.ts`, `src/controllers/youtube.ts`).
- Use the existing error style: `console.log('<context> failed:', error)` then `res.status(500).json({ message: 'Internal server error' })`.

## Architecture
- Entry point is `src/index.ts`: sets CORS headers, enables JSON, serves `public/`, and mounts API under `/api`.
- Routing is layered: `src/routes/index.ts` mounts feature routers (`/auth`, `/youtube`), each router delegates to controller functions.
- DB access is centralized in `src/lib/prisma.ts` via one exported `prismaClient`.
- Prisma client is generated to `src/generated/prisma` from `prisma/schema.prisma`; do not hand-edit generated files.

## Build and Test
- Install dependencies: `npm install`
- Run dev server: `npm start` (uses `nodemon` + `ts-node/esm` from `nodemon.json`).
- Type-check: `npx tsc --noEmit`
- Prisma after schema changes (preferred): `npx prisma migrate dev --name <change_name> && npx prisma generate`
- Fast local schema sync (no migration): `npx prisma db push && npx prisma generate`
- Manual API checks: run requests in `tests/api-tests.rest`.

## Project Conventions
- Use `createRequire(import.meta.url)` for CommonJS-only packages (`jsonwebtoken`, `yt-search`) as shown in controllers.
- Auth flow pattern:
  - `signup`: validate -> check uniqueness -> hash password -> return safe fields only.
  - `login`: validate -> find user -> compare hash -> return `{ user, token }`.
- Keep YouTube search response shape stable (`query`, `count`, `results[]`) from `src/controllers/youtube.ts`.
- Add new endpoints by following the checklist in `helper.md` and mount route groups in `src/routes/index.ts`.

## Integration Points
- Database: MySQL/MariaDB through Prisma MariaDB adapter (`@prisma/adapter-mariadb`) in `src/lib/prisma.ts`.
- Secrets/config come from `.env` loaded by `src/secrets.ts`.
- Static frontend files are served directly from `public/`.
- External API dependency: YouTube search through `yt-search` in `src/controllers/youtube.ts`.

## Security
- Required env vars: `DATABASE_URL`, `JWT_SECRET`; startup should fail fast if missing (`src/secrets.ts`).
- Never return password hashes in API responses; follow current `signup` response pattern.
- Keep password hashing with `bcrypt` and compare with `compareSync` unless refactoring auth holistically.
- JWT signing uses `JWT_SECRET`; preserve token payload compatibility (`{ userId }`) unless coordinated.
- CORS is currently permissive (`*`) in `src/index.ts`; do not tighten/alter without explicit product requirement.
