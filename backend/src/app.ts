import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";
import path from "path";

// routes
import userRoutes from "./routes/user.route";
import uploadRoutes from "./routes/upload.route";
import adminUserRoutes from "./routes/admin.user.route";


const app: Application = express();

const corsOptions = {
    origin: true, // frontend origin, localhost:3000
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(morgan("combined")); // log all requests

app.use("/api/v1/auth", userRoutes); // user related routes
app.use("/api/v1/admin/users", adminUserRoutes); // admin user management
// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/v1/uploads", uploadRoutes); // upload related routes


// global api handler (at the last)
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)
// global error handler (at the last)
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }
        return ApiResponseHelper.error(
            res, err?.message || "Internal Server Error", 500
        );
    }
)

export default app;