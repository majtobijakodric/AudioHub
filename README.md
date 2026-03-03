# AudioHub

AudioHub is a beginner-friendly backend project for searching YouTube content and downloading song audio metadata/files.
It is built with TypeScript, Node.js, Express, Prisma, and MySQL/MariaDB.

## Features
- User authentication (`signup`, `login`) with JWT
- YouTube search endpoint
- Song download flow with dedup/repair by `videoId`
- Prisma-based persistence for users, authors, and songs
- Structured application logging

## Tech Stack
- TypeScript + Node.js + Express
- Prisma ORM + MySQL/MariaDB
- `yt-search` and `yt-dlp-wrap`

## Quick Start
For full setup instructions, use [documentation/setup.md](documentation/setup.md).

```bash
npm install
npx prisma generate
npm start
```

## Documentation
- [Setup](documentation/setup.md)
- [Configuration](documentation/configuration.md)
- [Architecture](documentation/architecture.md)
- [API](documentation/api.md)
- [Database](documentation/database.md)
- [Operations](documentation/operations.md)
- [Security](documentation/security.md)

Planning and standards:
- [Documentation plan](documentation/plan.md)
- [Copilot documentation guidelines](documentation/co-pilot.md)

## Project Structure
- `src/` application code
- `prisma/` schema and migrations
- `documentation/` maintainable topic-based docs
- `tests/` manual REST request files
- `data/songs/` downloaded audio files

## License
This project is licensed under [LICENSE.txt](LICENSE.txt).
