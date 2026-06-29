import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface UserRecord {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: "admin" | "user";
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedUsersResponse {
    success: boolean;
    message: string;
    data: UserRecord[];
    meta: PaginationMeta;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: "admin" | "user";
}

/** GET /api/v1/admin/users?page=1&limit=10&search= */
export const getAdminUsers = async (
    params: GetUsersParams = {}
): Promise<PaginatedUsersResponse> => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET, { params });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch users");
    }
};

/** GET /api/v1/admin/users/:id */
export const getAdminUser = async (id: string): Promise<{ data: UserRecord }> => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS.GET_ONE(id));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch user");
    }
};

/** POST /api/v1/admin/users */
export const createAdminUser = async (
    payload: CreateUserPayload
): Promise<{ data: UserRecord }> => {
    try {
        const response = await axiosInstance.post(API.ADMIN.USERS.CREATE, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create user");
    }
};

/** PUT /api/v1/admin/users/:id */
export const updateAdminUser = async (
    id: string,
    payload: UpdateUserPayload
): Promise<{ data: UserRecord }> => {
    try {
        const response = await axiosInstance.put(API.ADMIN.USERS.UPDATE(id), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update user");
    }
};

/** DELETE /api/v1/admin/users/:id */
export const deleteAdminUser = async (id: string): Promise<void> => {
    try {
        await axiosInstance.delete(API.ADMIN.USERS.DELETE(id));
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete user");
    }
};
