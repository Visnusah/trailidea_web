import { z } from "zod";
export const UserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user"]).default("user"),
    imageUrl: z.string().optional(),
    bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
    coverImageUrl: z.string().optional(),
    preferredTerrains: z.array(z.string()).max(4, "Maximum 4 terrain tags allowed").optional(),
});
export type UserType = z.infer<typeof UserSchema>;