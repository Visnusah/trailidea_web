import { UserMongoRepository } from "../repositories/user.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";

const userRepository = new UserMongoRepository();

export class AdminUserService {
    /**
     * List users with pagination and optional full-text search
     * across firstName, lastName, email, and username.
     */
    async getUsers(
        page: number,
        limit: number,
        search?: string
    ): Promise<{ users: IUser[]; total: number; totalPages: number }> {
        const { users, total } = await userRepository.getPaginated(page, limit, search);
        const totalPages = Math.ceil(total / limit);
        return { users, total, totalPages };
    }

    /**
     * Get a single user by Mongo ObjectId.
     * Throws 404 if not found.
     */
    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    /**
     * Admin creates a user — allows setting role.
     * Validates uniqueness of email and username before inserting.
     * Password is hashed with bcrypt (cost 10).
     */
    async createUser(data: AdminCreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(data.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(data.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const user = await userRepository.createUser({
            ...data,
            password: hashedPassword,
        });
        return user;
    }

    /**
     * Admin updates any field on a user, including role.
     * Re-hashes password if a new one is supplied.
     * Checks uniqueness constraints if email/username changes.
     */
    async updateUser(id: string, data: AdminUpdateUserDTO): Promise<IUser> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }

        // Uniqueness checks only when the value actually changes
        if (data.email && data.email !== existing.email) {
            const emailTaken = await userRepository.getUserByEmail(data.email);
            if (emailTaken) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if (data.username && data.username !== existing.username) {
            const usernameTaken = await userRepository.getUserByUsername(data.username);
            if (usernameTaken) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (data.password) {
            data.password = await bcryptjs.hash(data.password, 10);
        }

        const updated = await userRepository.update(id, data);
        if (!updated) {
            throw new HttpException(500, "Failed to update user");
        }
        return updated;
    }

    /**
     * Hard-delete a user by id. Throws 404 if not found.
     */
    async deleteUser(id: string): Promise<void> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }
        await userRepository.delete(id);
    }
}
