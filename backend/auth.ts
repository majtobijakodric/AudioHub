import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from "passport-local";
import type { PassportStatic } from "passport";

const SALT_ROUNDS = 10;

async function getUserByUsername(username: string) {
    return prisma.user.findUnique({
        where: {
            username: username
        }
    });
}

async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    });
}

export async function createUser(username: string, password: string) {

    let user = null;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        user = await prisma.user.create({
            data: {
                username: username,
                hashedPassword: hashedPassword
            }
        });
    } catch (error) {
        return false;
    }

    console.log(`[INFO] register: added user ${username} to the database`);

    return (user == null) ? false : true;
}

export function initializePassport(passport: PassportStatic) {
    const authenticateUser = async (username: string, password: string,
        done: (error: unknown, user?: Express.User | false, options?: { message: string }) => void
    ) => {
        try {
            const user = await getUserByUsername(username);

            if (user == null) {
                return done(null, false, { message: "No user with that username!" });
            }

            if (await bcrypt.compare(password, user.hashedPassword)) {
                return done(null, user);
            }

            return done(null, false, { message: "Password incorrect" });
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "username" }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, (user as { id: string }).id);
    });
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await getUserById(id);
            return done(null, user || false);
        } catch (error) {
            return done(error);
        }
    });
}

