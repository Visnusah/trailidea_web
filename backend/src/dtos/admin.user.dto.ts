import { z } from "zod";
import { UserSchema } from "../types/user.type";

/**
 * AdminCreateUserDTO — like regular CreateUserDTO but also allows setting `role`.
 * Used by admins to create any user with a specific role.
 */
export const AdminCreateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
}).extend({
    role: z.enum(["admin", "user"]).default("user"),
    imageUrl: z.string().url("Invalid image URL").optional(),
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

/**
 * AdminUpdateUserDTO — full partial update, including role change.
 * All fields optional; password is re-hashed if provided.
 */
export const AdminUpdateUserDTO = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    username: z.string().min(3, "Username must be at least 3 characters long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    role: z.enum(["admin", "user"]).optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
});
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

/**
 * PaginationQueryDTO — typed query params for the list endpoint.
 */
export const PaginationQueryDTO = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
});
export type PaginationQueryDTO = z.infer<typeof PaginationQueryDTO>;
