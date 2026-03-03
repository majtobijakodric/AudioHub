# Setup

## Purpose
Get the project running locally from a fresh clone.

## Prerequisites
- Node.js (LTS)
- npm
- Git
- MySQL or MariaDB
- Optional: VS Code REST Client extension

## Steps
1. Clone and install dependencies.

```bash
git clone https://github.com/majtobijakodric/audiohub.git
cd audiohub
npm install
```

2. Create your `.env` file with required variables.

```env
DATABASE_URL="mysql://audiohub-user:Test123@localhost:3306/audiohub"
PORT=8080
JWT_SECRET=type_your_secret_here
```

3. Generate Prisma client and apply migrations.

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Start the development server.

```bash
npm start
```

## Verification
- Server logs should show it is running on `http://localhost:8080`.
- Open `tests/auth.rest` and send a signup or login request.

## Related
- [Configuration](configuration.md)
- [Database](database.md)
- [Operations](operations.md)
