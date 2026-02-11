# AudioHub

AudioHub is a free and open source music web app project.
Right now this is a backend beginner project built with TypeScript, Node.js, Express, Prisma, and MySQL/MariaDB.

## What is built right now
- Express server with JSON support
- API route group: `/api`
- Auth route: `POST /api/auth/signup`
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
- Postman (optional, for testing)

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
PORT=8000
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
Server is running at http://localhost:8000
```

## Test with Postman
Method: `POST`  
URL: `http://localhost:8000/api/auth/signup`  
Body type: `raw` + `JSON`

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret123"
}
```

## Common beginner problems

### 1) `ECONNREFUSED 127.0.0.1:8000`
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
