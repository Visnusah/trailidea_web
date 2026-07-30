import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 8089;
export const DUMMY: string = process.env.DUMMY || "Dummy Export";
// MongoDB connection URL (127.0.0.1 works reliably for both Simulator & Physical Device backend setups)
export const MONGODB_URL: string = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/trailidea_backend";
export const SECRET_KEY: string = process.env.SECRET_KEY || "trailidea_secret_key";

export const EMAIL_USER: string =
    process.env.EMAIL_USER || "sahk5858@gmail.com";
export const RESEND_API_KEY: string =
    process.env.RESEND_API_KEY || "";
export const CLIENT_URL: string =
    process.env.CLIENT_URL || 'http://localhost:3000';

// Cloudflare R2 Settings
export const R2_ACCOUNT_ID: string = process.env.R2_ACCOUNT_ID || "3fb5e37d7cb26b1858f545356dfe75cd";
export const R2_ACCESS_KEY_ID: string = process.env.R2_ACCESS_KEY_ID || "";
export const R2_SECRET_ACCESS_KEY: string = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME: string = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL: string = process.env.R2_PUBLIC_URL || "";