# Architecture

## Purpose
Give a beginner-friendly overview of how the backend is organized.

## High-Level Flow
1. `src/index.ts` starts Express and mounts API routes under `/api`.
2. Route files in `src/routes/` map URL paths to controllers.
3. Controllers in `src/controllers/` validate input and run business logic.
4. Database access goes through Prisma client from `src/lib/prisma.ts`.
5. Logging is centralized in `src/lib/logger.ts`.

## Folder Responsibilities
- `src/index.ts`: app bootstrap, middleware, static files, route mounting.
- `src/routes/`: route grouping (`auth`, `youtube`, `songs`).
- `src/controllers/`: request handling and response shaping.
- `src/lib/`: shared infrastructure (`prisma`, `logger`).
- `prisma/`: schema and migrations.
- `data/songs/`: downloaded audio storage.

## Design Conventions
- Validate request bodies early and return on failure.
- Keep controllers async and return JSON.
- Keep public API response shapes stable.

## Verification
- Trace one request path (for example `/api/auth/login`) from route to controller.
- Confirm DB operations are done through Prisma client.

## Related
- [API](api.md)
- [Database](database.md)
- [Operations](operations.md)
