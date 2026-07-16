import { z } from "zod";

export const PostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
    subtitle: z.string().max(300, "Subtitle must be under 300 characters").optional(),
    description: z.string().min(1, "Description is required").max(5000, "Description must be under 5000 characters"),
    imageUrls: z.array(z.string()).optional().default([]),
    links: z.array(z.string().url("Each link must be a valid URL")).optional().default([]),
    mapData: z.any().optional(),
});

export type PostType = z.infer<typeof PostSchema>;
