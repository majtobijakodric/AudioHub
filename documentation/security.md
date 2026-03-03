# Security

## Purpose
Capture the basic security expectations for this project.

## Secrets and Configuration
- Required secrets: `DATABASE_URL`, `JWT_SECRET`.
- Keep `.env` private and never commit real secrets.
- Fail fast when required secrets are missing.

## Authentication Rules
- Never return password hashes in API responses.
- Keep JWT payload compatibility unless migration is planned.
- Use existing hashing and comparison approach unless refactoring auth holistically.

## API and Data Safety
- Validate request input early.
- Return safe, minimal user fields.
- Keep route behavior consistent to avoid accidental contract breaks.

## Operational Safety
- Use logging for observability, but avoid logging secrets.
- Review docs and code together when auth/config behavior changes.

## Verification
- Check that auth responses do not include password hashes.
- Check startup fails if required env variables are missing.

## Related
- [Configuration](configuration.md)
- [API](api.md)
- [Operations](operations.md)
