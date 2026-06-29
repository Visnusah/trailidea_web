import { Request, Response } from "express";
import { AdminUserService } from "../services/admin.user.service";
import {
    AdminCreateUserDTO,
    AdminUpdateUserDTO,
    PaginationQueryDTO,
} from "../dtos/admin.user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const adminUserService = new AdminUserService();

export class AdminUserController {
    /**
     * GET /api/v1/admin/users
     * Query params: page, limit, search
     */
    async listUsers(req: Request, res: Response) {
        try {
            const queryParse = PaginationQueryDTO.safeParse(req.query);
            if (!queryParse.success) {
                return ApiResponseHelper.error(
                    res,
                    queryParse.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }
            const { page, limit, search } = queryParse.data;
            const { users, total, totalPages } = await adminUserService.getUsers(
                page,
                limit,
                search
            );
            return ApiResponseHelper.success(
                res,
                users,
                "Users fetched successfully",
                200,
                { page, limit, total, totalPages }
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * GET /api/v1/admin/users/:id
     */
    async getUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await adminUserService.getUserById(id);
            return ApiResponseHelper.success(res, user, "User fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * POST /api/v1/admin/users
     */
    async createUser(req: Request, res: Response) {
        try {
            const parsed = AdminCreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }
            const user = await adminUserService.createUser(parsed.data);
            return ApiResponseHelper.success(res, user, "User created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * PUT /api/v1/admin/users/:id
     */
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsed = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(
                    res,
                    parsed.error.errors.map((e) => e.message).join(", "),
                    400
                );
            }
            const user = await adminUserService.updateUser(id, parsed.data);
            return ApiResponseHelper.success(res, user, "User updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    /**
     * DELETE /api/v1/admin/users/:id
     */
    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await adminUserService.deleteUser(id);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
