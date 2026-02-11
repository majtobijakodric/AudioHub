import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Good for lated debugging missing environment variables
const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing required environment variable: ${name}`);

    return value;
};


export const DATABASE_URL = requireEnv("DATABASE_URL");
export const PORT = Number(process.env.PORT ?? 8000);
export const JWT_SECRET = requireEnv("JWT_SECRET");
