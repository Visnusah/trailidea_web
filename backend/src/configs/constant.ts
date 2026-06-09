import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 8089; 
export const DUMMY: string = process.env.DUMMY || "Dummy Export";    
export const MONGODB_URL: string = process.env.MONGODB_URL || "mongodb://localhost:27017/trailidea_backend"; 
export const SECRET_KEY: string = process.env.SECRET_KEY || "trailidea_secret_key";