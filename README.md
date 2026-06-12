# AudioHub

> A self-hosted music streaming app — search YouTube, download as MP3, organize into playlists, and play in the browser. No ads. No subscriptions.

**Live demo:** [audiohub.kodric.top](https://audiohub.kodric.top)

![AudioHub home screen](assets/screenshot-home.png)

---

## Features

- Search YouTube — find any song instantly
- Download as MP3 — stored locally on the server
- Smart deduplication — if two users download the same song, only one file is saved on disk
- Playlists — create and manage your own playlists
- Auto-play — automatically plays the next song in queue
- User accounts — register, log in, each user has their own library
- Secure — passwords hashed with bcrypt, sessions managed with Passport.js

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Backend | Express |
| Database | MariaDB |
| ORM | Prisma |
| Auth | Passport.js + bcrypt |
| Frontend | EJS + Tailwind CSS |
| Music | yt-dlp |

---

## Screenshots

![Login page](assets/screenshot-login.png)

![Search results](assets/screenshot-search.png)

![Playlist view](assets/screenshot-playlist.png)

---

## Windows Setup

### Prerequisites

- [Node.js LTS](https://nodejs.org/)
- MySQL or MariaDB
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — must be installed and available in your system PATH
- Git

### 1. Clone the project

```powershell
git clone <repo-url>
cd audiohub
```

### 2. Create the environment file

Copy `.env.example` to `.env` and fill in your database values.

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/database_name"
DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="database_name"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
SESSION_SECRET="your_secret_here"
PORT=8080
```

### 3. Install dependencies

```powershell
npm install
```

### 4. Set up the database

This creates all the required tables in your database.

```powershell
npm run prisma-migrate-generate
```

### 5. Start the app

```powershell
npm run dev
```

App runs at `http://localhost:8080`

---

## Notes

- Downloaded songs are stored in `data/songs/`
- yt-dlp must be installed separately — it is not bundled with npm install
- Sessions are stored in the database via `express-mysql-session`

---

## Author

Maj Tobija Kodrič — final thesis project, Šolski center Nova Gorica, 2025/2026