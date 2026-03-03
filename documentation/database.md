# Database

## Purpose
Explain how data is modeled and managed with Prisma and MySQL/MariaDB.

## Current Stack
- Prisma ORM
- MySQL/MariaDB database
- Prisma client generated in `src/generated/prisma`

## Core Concepts
- `prisma/schema.prisma` is the source of truth for models.
- `prisma/migrations/` tracks schema history.
- Application code imports a shared Prisma client from `src/lib/prisma.ts`.

## Common Workflows
### Preferred after schema changes
```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
```

### Fast local sync (no migration file)
```bash
npx prisma db push
npx prisma generate
```

## Verification
- Run `npx prisma migrate status` to inspect migration state.
- Start the server and verify DB-backed routes work.

## Related
- [Setup](setup.md)
- [Configuration](configuration.md)
- [Operations](operations.md)
