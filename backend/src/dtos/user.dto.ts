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
export const LoginUserDTO = UserSchema.pick({
    email: true,
    password: true
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;


export const UpdateUserDto = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
    imageUrl: true,
    bio: true,
    coverImageUrl: true,
    preferredTerrains: true,
}).partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;