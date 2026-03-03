# API

## Purpose
Document the current HTTP endpoints and their expected behavior.

## Base URL
- Local development: `http://localhost:8080/api`

## Endpoints
### Auth
- `POST /auth/signup`
- `POST /auth/login`

### YouTube
- `POST /youtube/search`

### Songs
- `POST /songs/download`

## Request and Response Notes
- Requests use JSON bodies.
- Validate required fields before processing.
- Return consistent JSON responses for success and failure.

## Manual Testing
Use REST files in `tests/`:
- `tests/auth.rest`
- `tests/youtube.rest`
- `tests/songs.rest`

## Verification
- Start server with `npm start`.
- Send requests from `.rest` files and verify status + response shape.

## Related
- [Setup](setup.md)
- [Architecture](architecture.md)
