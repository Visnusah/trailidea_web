import { z } from "zod";

// ── Post Creation Schema (frontend form validation)
export const createPostSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be under 200 characters"),
    subtitle: z
        .string()
        .max(300, "Subtitle must be under 300 characters")
        .optional()
        .or(z.literal("")),
    description: z
        .string()
        .min(1, "Description is required")
        .max(5000, "Description must be under 5000 characters"),
    links: z
        .array(
            z.object({
                value: z.string().url("Must be a valid URL").or(z.literal("")),
            })
        )
        .optional()
        .default([]),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
