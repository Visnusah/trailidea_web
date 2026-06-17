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

const uploads = {
    single: (
        fieldName: string
    ) => upload.single(fieldName),
    array: (
        fieldName: string,
        maxCount: number
    ) => upload.array(fieldName, maxCount),
    fields: (
        fieldsArray: {
            name: string,
            maxCount?: number
        }[]
    ) => upload.fields(fieldsArray)
};

export default uploads;