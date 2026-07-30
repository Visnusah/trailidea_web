import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { HttpException } from "../exceptions/http-exception";
import fs from "fs";
import crypto from "crypto";
const storage = multer.diskStorage(
    {
        destination:(
            req: Request,
            file: any,
            cb: (error: Error | null, destination: string) => void
        
        ) => {
            const uploadPath = path.join(__dirname, "../uploads"); // --dirname - current dir
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (
            req: Request,
            file: any,
            cb: (error: Error | null, filename: string) => void
        ) => {
            const fileSuffix = crypto.randomUUID(); // generate suffix
            cb(null, `${fileSuffix}-${file.originalname}`); // upload unique filename
        }
    }
);

const fileFilter = (
    req: Request,
    file: any,
    cd: FileFilterCallback

) => {
    if(
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/HEIF" ||
        file.mimetype === "image/heic"
    ) {
        cd(null, true); // accept file
    } else {
        cd(new HttpException(400, "Invalid file type only images are allowed in early stage")); // reject file
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../configs/constant";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    }
});

const processImages = async (req: Request, res: any, next: any) => {
    if (!req.file && !req.files) return next();

    const processFile = async (file: Express.Multer.File) => {
        const isHeic = file.mimetype === "image/heic" || 
                       file.mimetype === "image/HEIF" || 
                       file.originalname.toLowerCase().endsWith(".heic") ||
                       file.originalname.toLowerCase().endsWith(".heif");
                       
        if (isHeic) {
            const tempPath = file.path;
            const newFilename = file.filename.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
            const newPath = path.join(path.dirname(tempPath), newFilename + (newFilename.endsWith(".jpg") ? "" : ".jpg"));
            
            await sharp(tempPath).jpeg().toFile(newPath);
            
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            
            file.path = newPath;
            file.filename = path.basename(newPath);
            file.mimetype = "image/jpeg";
        }

        // Upload to Cloudflare R2
        if (R2_ACCESS_KEY_ID && R2_BUCKET_NAME) {
            const fileContent = fs.readFileSync(file.path);
            const r2Key = `uploads/${Date.now()}-${file.filename}`;
            
            await s3Client.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: r2Key,
                Body: fileContent,
                ContentType: file.mimetype,
            }));
            
            // Delete local temp file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            
            // Overwrite file properties to use the public R2 URL
            const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;
            file.path = publicUrl;
            file.filename = publicUrl; // Assuming DB stores this
        }
    };

    try {
        if (req.file) {
            await processFile(req.file as Express.Multer.File);
        } else if (req.files) {
            if (Array.isArray(req.files)) {
                await Promise.all(req.files.map((f: any) => processFile(f)));
            } else {
                for (const key in req.files) {
                    await Promise.all((req.files as any)[key].map((f: any) => processFile(f)));
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

const uploads = {
    single: (fieldName: string) => [upload.single(fieldName), processImages],
    array: (fieldName: string, maxCount: number) => [upload.array(fieldName, maxCount), processImages],
    fields: (fieldsArray: { name: string, maxCount?: number }[]) => [upload.fields(fieldsArray), processImages]
};

export default uploads;