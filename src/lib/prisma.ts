import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
import { DATABASE_URL } from '../secrets.js';

const adapter = new PrismaMariaDb(DATABASE_URL);

export const prismaClient = new PrismaClient({ adapter });
