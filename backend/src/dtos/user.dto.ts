import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create a DTO for creating a user
// export const CreateUserDTO = UserSchema.omit({ role: true });
export const CreateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true
});
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login Dto
// 1. Create new schame
// export const LoginUserDTO = z.object({
//     email: z.email(),
//     password: z.string().min(6, "Password must be at least 6 characters long")
// });
// 2. Reuse existing schema
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;