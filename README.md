# AudioHub

AudioHub is a free and open source music web app project.
Right now this is a backend beginner project built with TypeScript, Node.js, Express, Prisma, and MySQL/MariaDB.

## What is built right now
- Express server with JSON support
- API route group: `/api`
- Auth route: `POST /api/auth/signup`
- Auth route: `POST /api/auth/login`
- YouTube search route: `POST /api/youtube/search`
- Signup logic:
  - checks required fields (`name`, `email`, `password`)
  - checks if email already exists
  - hashes password with `bcrypt`
  - saves user to database
- Prisma `User` model and migration

## Requirements
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Git
- MySQL or MariaDB
- REST Client extension for VS Code (recommended): https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- Postman (optional alternative): https://www.postman.com/downloads/

## Fresh install setup (Windows + Linux)

### 1) Install Node.js and Git
Windows:
- Node.js: https://nodejs.org/en/download
- Git: https://git-scm.com/download/win

Linux (Ubuntu/Debian example):
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

Linux (Arch/Manjaro example):
```bash
sudo pacman -S nodejs npm git
```

### 2) Install MySQL / MariaDB
Windows:
- Install MySQL Community Server (or MariaDB) with installer.
- During setup, create a root password.

Linux (Ubuntu/Debian example):
```bash
sudo apt update
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb
```

Linux (Arch/Manjaro example):
```bash
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable --now mariadb
```

### 3) Create database and user
Login as root:
```bash
mysql -u root -p
```

Inside MySQL:
```sql
CREATE DATABASE audiohub;
CREATE USER 'audiohub-user'@'localhost' IDENTIFIED BY 'Test123';
GRANT ALL PRIVILEGES ON audiohub.* TO 'audiohub-user'@'localhost';
FLUSH PRIVILEGES;
```

### 4) Clone project and install packages
```bash
git clone https://github.com/majtobijakodric/audiohub.git
cd audiohub
npm install
```

### 5) Create your `.env` file
Copy `.env.example` to `.env`, then set your real values.

Example:
```env
DATABASE_URL="mysql://audiohub-user:Test123@localhost:3306/audiohub"
PORT=8080
JWT_SECRET=type_your_secret_here
```

### 6) Prisma setup
```bash
npx prisma generate
npx prisma migrate deploy
```

### 7) Run development server
```bash
npm start
```

If it works, terminal should show:
```text
Server is running at http://localhost:8080
```

## Test API (REST Client preferred, Postman optional)

I personally use REST Client (VS Code extension marketplace):
https://marketplace.visualstudio.com/items?itemName=humao.rest-client

Postman app (alternative):
https://www.postman.com/downloads/

### Option A: REST Client in VS Code (recommended)
1. Open `tests/api-tests.rest`
2. Start server: `npm start`
3. Click **Send Request** above each request

Requests in that file use:
- `POST http://localhost:8080/api/auth/signup`
- `POST http://localhost:8080/api/auth/login`
- `POST http://localhost:8080/api/youtube/search`

### Option B: Postman (alternative)
Method: `POST`  
URL: `http://localhost:8080/api/auth/signup`  
Body type: `raw` + `JSON`

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret123"
}
```

### YouTube search request/response example
Method: `POST`  
URL: `http://localhost:8080/api/youtube/search`  
Body type: `raw` + `JSON`

Request:
```json
{
  "ytTiltle": "lofi hip hop"
}
```

Response:
```json
{
  "query": "lofi hip hop",
  "count": 5,
  "results": [
    {
      "videoId": "string",
      "title": "string",
      "url": "string",
      "duration": {
        "seconds": 123,
        "timestamp": "2:03"
      },
      "views": 123456,
      "author": "channel name",
      "thumbnail": "https://..."
    }
  ]
}
```

## Common beginner problems

### 1) `ECONNREFUSED 127.0.0.1:8080`
This means server is not running (or wrong port).
- Check terminal for crash error
- Check `PORT` in `.env`
- Start again with `npm start`

### 2) Prisma client error (`did not initialize` / adapter error)
Run:
```bash
npx prisma generate
```

### 3) Database login error
Usually wrong `DATABASE_URL`.
- check username/password/port/database name
- verify MySQL/MariaDB service is running

## Current scripts
```bash
npm start
```

This starts `nodemon` and reloads on file changes in `src/`.
