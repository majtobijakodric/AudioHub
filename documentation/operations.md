# Operations

## Purpose
Describe day-to-day commands for running, checking, and troubleshooting the project.

## Common Commands
### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm start
```

### Type-check
```bash
npx tsc --noEmit
```

### Prisma status
```bash
npx prisma migrate status
```

## Troubleshooting Basics
1. If API calls fail, confirm server is running.
2. If auth or DB routes fail, verify `.env` values.
3. If Prisma errors appear, run `npx prisma generate`.
4. If schema changed, run migrate workflow before retrying.

## Verification
- API responds at `/api/*` routes.
- Type-check passes without errors.

## Related
- [Setup](setup.md)
- [Database](database.md)
- [Security](security.md)
