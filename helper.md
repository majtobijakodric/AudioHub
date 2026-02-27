# Helper Guide

- [Database Model Change](#prisma-model-change-workflow)

## Database model change
Use this every time you edit `prisma/schema.prisma`.

1. Update your Prisma schema.
2. Apply schema changes to the database.
3. Regenerate Prisma client.
4. Restart the server.

## Commands

### Recommended (keeps migration history)

```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
```

### Fast local prototyping (no migration file)

```bash
npx prisma db push
npx prisma generate
```

## Quick Rules

- Use `migrate dev` for normal development and team projects.
- Use `db push` only for quick local iteration.
- If types look wrong after schema changes, run:

```bash
npx prisma generate
```

### What Is a Migration?

A migration is a versioned, tracked set of SQL changes that updates your database schema over time.

In Prisma:
- `prisma/schema.prisma` is your desired schema.
- A migration is the SQL change script Prisma creates in `prisma/migrations/...`.
- `npx prisma migrate dev` creates and applies that script.

Why this matters:
- Keeps a history of database changes.
- Lets teammates and CI apply the exact same schema updates.
- Makes debugging and rollback workflows easier than ad-hoc schema pushes.
