import { z } from "zod";

export const CommentSchema = z.object({
    postId: z.string().min(1, "Post ID is required"),
    text: z.string().min(1, "Comment text is required").max(1000, "Comment must be under 1000 characters"),
});

export type CommentType = z.infer<typeof CommentSchema>;
