# Setup

This guide helps you run the AudioHub backend on your own computer from scratch.

## What You Need
- Node.js
- npm
- Git
- MySQL or MariaDB

## 1. Get the Project
Clone the repo:

```bash
git clone https://github.com/majtobijakodric/audiohub.git
cd audiohub
```

If you do not want to use Git, you can also download the ZIP from the GitHub repository page and extract it.

## 2. Create the Database User and Database
Run these commands in MySQL:

```sql
CREATE DATABASE audiohub;
CREATE USER 'audiohub-user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON audiohub.* TO 'audiohub-user'@'localhost';
FLUSH PRIVILEGES;
```

You can change the database name, username, and password if you want. If you do, make sure the same values are used in your `.env` file.

## 3. Create the Environment File
Create a file named `.env` in the project root.

Example:

```env
DATABASE_URL="mysql://audiohub-user:your_password_here@localhost:3306/audiohub"
PORT=8080
JWT_SECRET=replace_this_with_a_long_random_secret
```

What these values mean:
- `DATABASE_URL`: tells the app how to connect to MySQL.
- `PORT`: the port where the backend will run. If you skip it, the app uses `8080`.
- `JWT_SECRET`: the secret key used when the backend creates login tokens.

## 4. Install Dependencies
Run:

```bash
npm install
```

## 5. Prepare Prisma
These commands generate the Prisma client and apply the database migrations.

```bash
npx prisma generate
npx prisma migrate deploy
```

## 6. Start the Server
Run:

```bash
npm run dev
```

If everything is working, you should see a log message that says the server is running on `http://localhost:8080`.

## 7. Check That It Works
Open this URL in your browser or API tool:

```text
http://localhost:8080/api/health
```

You should get this response:

```json
{
  "ok": true,
  "service": "audiohub"
}
```

You can also use the request files inside `tests/` to try the API.

## Where Logs Are Stored
The backend writes log files into:

```text
logs/
```

Each time the server starts, it creates a new log file there.

## Common Problems
- If the server fails on startup, check that `.env` exists and has the right values.
- If Prisma cannot connect, check your `DATABASE_URL`.
- If migrations fail, make sure the MySQL user has access to the `audiohub` database.
- If `http://localhost:8080/api/health` does not open, make sure the server is still running.
