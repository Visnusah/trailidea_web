import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    // 5 common mandatory methods for a repository
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async findById(userId: string): Promise<IUser | null> {
        return await UserModel.findById(userId);
    }

    async getUserById(id: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ _id: id });
        return found;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ email });
        return found;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const found = await UserModel.findOne({ username });
        return found;
    }
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const created = await UserModel.create(user);
        return created;
    }
    async getAll(): Promise<IUser[]> {
        const found = await UserModel.find();
        return found;
    }
    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const updated = await UserModel.findByIdAndUpdate(id, user, { new: true });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }

    /**
     * Paginated query with optional search across firstName, lastName, and email.
     */
    async getPaginated(
        page: number,
        limit: number,
        search?: string
    ): Promise<{ users: IUser[]; total: number }> {
        const query: Record<string, any> = {};

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i"); // case-insensitive
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { username: regex },
            ];
        }

        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find(query)
                .select("-password") // never return hashed password in list
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            UserModel.countDocuments(query),
        ]);

        return { users, total };
    }
}