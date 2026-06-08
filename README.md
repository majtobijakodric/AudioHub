# AudioHub

AudioHub is a local music library app where users can search YouTube songs, download them as MP3 files, organize them into playlists, and play them in the browser.

## Windows Setup

### Prerequisites

- Node.js LTS
- MySQL or MariaDB
- Git

### 1. Clone the project

```powershell
git clone https://github.com/majtobijakodric/audiohub.git
cd audiohub
```

### 2. Create the environment file

Copy `.env.example` to `.env` and set your database values.

Required variables:

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

### 4. Run database migrations

```powershell
npm run prisma-migrate-generate
```

### 5. Start the app

```powershell
npm run dev
```

### Notes

- Downloaded songs are stored in `data/songs/`.
- The app runs on `http://localhost:8080` by default.
