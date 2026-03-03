# Configuration

## Purpose
Explain how runtime configuration works and what values are required.

## Prerequisites
- Local `.env` file in the project root

## Required Environment Variables
- `DATABASE_URL`: Database connection string for MySQL/MariaDB.
- `JWT_SECRET`: Secret used to sign authentication tokens.

## Optional Environment Variables
- `PORT`: Server port (defaults depend on code/runtime setup).

## Configuration Rules
- Keep secrets out of source control.
- Use real values in local `.env`; avoid placeholder secrets in shared environments.
- If `DATABASE_URL` or `JWT_SECRET` is missing, startup should fail fast.

## Verification
- Start the server with `npm start`.
- If configuration is valid, app starts and API routes respond.

## Related
- [Setup](setup.md)
- [Security](security.md)
