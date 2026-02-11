import dotenv from "dotenv";

dotenv.config({path: ".env"});

export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || "mysql://audiohub-user:123@localhost:3306/audiohub";