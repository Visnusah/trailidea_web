import { Router, Request, Response } from "express";
import uploads from "../middlewares/upload.middleware";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";


const router = Router();
// single file upload

router.post(
    "/upload",
    uploads.single("image"),
    (req: Request, res: Response) => {
    try {
        if(!req.file){
            throw new HttpException(400, "No file uploaded");
        }
        const fileData = {
            ...req.file,
            path: "/uploads/" + req.file.filename
        };
        return ApiResponseHelper.success(res, fileData, "File uploaded successfully");
    } catch (error: any) {
        return ApiResponseHelper.error(res, error?.message || "Upload failed", error?.status || 500);
    }
});

export default router;