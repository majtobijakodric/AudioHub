# API

This file explains what each AudioHub API endpoint does, what data it expects, and what it returns.

## Base URL
Local backend URL:

```text
http://localhost:8080/api
```

## General Notes
- Most endpoints use JSON.
- For `POST` requests, send `Content-Type: application/json`.
- Error responses usually look like this:

```json
{
  "message": "Something went wrong"
}
```

## GET /health
Checks whether the backend is running.

### What it does
Returns a simple response that shows the server is alive.

### Example request
```http
GET /api/health
```

### Success response
Status: `200 OK`

```json
{
  "ok": true,
  "service": "audiohub"
}
```

### Frontend note
Use this endpoint to test whether the backend is online.

## POST /auth/signup
Creates a new user account.

### What it does
Takes a name, email, and password. If the email is not already used, it creates the user.

### Request body
```json
{
  "name": "newuser",
  "email": "newuser@example.com",
  "password": "123"
}
```

### Success response
Status: `201 Created`

```json
{
  "name": "newuser",
  "email": "newuser@example.com",
  "createdAt": "2026-04-13T20:00:00.000Z"
}
```

### Common errors
- `400 Bad Request`: `name`, `email`, or `password` is missing
- `409 Conflict`: a user with this email already exists
- `500 Internal Server Error`: unexpected server problem

### Frontend note
Use this endpoint when the user registers for the first time.

## POST /auth/login
Logs a user in.

### What it does
Checks the email and password. If they are correct, it returns the user data and a login token.

### Request body
```json
{
  "email": "newuser@example.com",
  "password": "123"
}
```

### Success response
Status: `200 OK`

```json
{
  "user": {
    "name": "newuser",
    "email": "newuser@example.com",
    "createdAt": "2026-04-13T20:00:00.000Z",
    "updatedAt": "2026-04-13T20:00:00.000Z"
  },
  "token": "your_jwt_token_here"
}
```

### Common errors
- `400 Bad Request`: `email` or `password` is missing
- `404 Not Found`: user does not exist
- `401 Unauthorized`: password is wrong
- `500 Internal Server Error`: unexpected server problem

### Frontend note
- Save the `token` after login if your frontend needs it.
- The returned `user` object does not include sensitive fields like `password`.

## POST /youtube/search
Searches YouTube videos.

### What it does
Searches YouTube using the text in `ytTitle` and returns up to 5 results.

### Request body
```json
{
  "ytTitle": "21 savage"
}
```

### Success response
Status: `200 OK`

```json
{
  "query": "21 savage",
  "count": 2,
  "results": [
    {
      "videoId": "example1",
      "title": "21 Savage - Song Title",
      "url": "https://www.youtube.com/watch?v=example1",
      "duration": {
        "seconds": 212,
        "timestamp": "3:32"
      },
      "views": 123456,
      "author": "21 Savage",
      "thumbnail": "https://i.ytimg.com/vi/example1/default.jpg"
    }
  ]
}
```

### Common errors
- `400 Bad Request`: `ytTitle` is missing or empty
- `502 Bad Gateway`: YouTube search failed
- `500 Internal Server Error`: unexpected server problem

### Frontend note
- Send the song name or artist name in `ytTitle`.
- The frontend can use the returned `videoId`, `title`, `author`, `duration`, and `thumbnail` for search results.

## POST /songs/download
Downloads a song from YouTube and stores it in the backend.

### What it does
Takes only a YouTube video ID, fetches metadata on the server, downloads the audio, saves the file, and stores the song in the database.

### Request body
```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

### Success response for a new download
Status: `201 Created`

```json
{
  "message": "Song downloaded successfully",
  "song": {
    "id": 1,
    "videoId": "dQw4w9WgXcQ",
    "title": "Rick Astley - Never Gonna Give You Up",
    "durationSeconds": 212,
    "filePath": "/home/user/audiohub/data/songs/dQw4w9WgXcQ.opus",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
    "status": "downloaded",
    "downloadedAt": "2026-04-13T20:10:00.000Z",
    "lastListenedAt": null,
    "createdAt": "2026-04-13T20:10:00.000Z",
    "updatedAt": "2026-04-13T20:10:00.000Z"
  }
}
```

### Success response if the song already exists
Status: `200 OK`

```json
{
  "message": "Song already downloaded",
  "song": {
    "id": 1,
    "videoId": "dQw4w9WgXcQ"
  }
}
```

### Common errors
- `400 Bad Request`: `videoId` is missing or empty
- `502 Bad Gateway`: metadata fetch from YouTube failed
- `502 Bad Gateway`: download from YouTube failed
- `500 Internal Server Error`: unexpected server problem

### Frontend note
- Call this after the user chooses a YouTube result.
- Send only `videoId`.
- The backend fetches and trusts metadata from YouTube (not from client input).
- The frontend should format `durationSeconds` for display (for example, `212` -> `3:32`).
- The audio file is stored by the backend in `data/songs/`.

## GET /songs/listsongs
Returns all downloaded songs.

### What it does
Fetches all songs from the database and returns them ordered by `downloadedAt` descending (newest first).

### Example request
```http
GET /api/songs/listsongs
```

### Success response
Status: `200 OK`

```json
{
  "songs": [
    {
      "id": 12,
      "videoId": "dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up",
      "durationSeconds": 212,
      "filePath": "/home/user/audiohub/data/songs/dQw4w9WgXcQ.opus",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
      "status": "downloaded",
      "downloadedAt": "2026-04-20T10:00:00.000Z",
      "lastListenedAt": null,
      "createdAt": "2026-04-20T10:00:00.000Z",
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

### Common errors
- `500 Internal Server Error`: unexpected server problem

### Frontend note
- Use this endpoint to render the local downloaded songs list.
- Results are already ordered newest-first by `downloadedAt`.

## Test Files
You can try these endpoints with the request files in `tests/`:
- `tests/health.rest`
- `tests/auth.rest`
- `tests/youtube.rest`
- `tests/songs.rest`

## Related
- [Setup](setup.md)
