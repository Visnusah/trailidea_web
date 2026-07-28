import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 8089;
export const DUMMY: string = process.env.DUMMY || "Dummy Export";
// MongoDB connection URL (127.0.0.1 works reliably for both Simulator & Physical Device backend setups)
export const MONGODB_URL: string = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/trailidea_backend";
export const SECRET_KEY: string = process.env.SECRET_KEY || "trailidea_secret_key";

export const EMAIL_USER: string =
    process.env.EMAIL_USER || "sahk5858@gmail.com";
export const EMAIL_PASS: string =
    process.env.EMAIL_PASS || "bokd klkn mjjt ahih";
export const CLIENT_URL: string =
    process.env.CLIENT_URL || 'http://localhost:3000';