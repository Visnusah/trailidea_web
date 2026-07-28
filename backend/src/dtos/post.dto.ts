import { z } from "zod";
import { PostSchema, MapDataSchema } from "../types/post.type";

/**
 * CreatePostDTO — validates incoming post creation data.
 * imageUrls are injected server-side from multer, not from the client body.
 */
export const CreatePostDTO = PostSchema.pick({
    title: true,
    subtitle: true,
    description: true,
    links: true,
    mapData: true,
});
export type CreatePostDTO = z.infer<typeof CreatePostDTO>;

/**
 * EditPostDTO — validates incoming post edits.
 * Links and imageOrder are parsed from form fields.
 */
export const EditPostDTO = PostSchema.pick({
    title: true,
    subtitle: true,
    description: true,
    links: true,
    mapData: true,
}).partial().extend({
    imageOrder: z.string().optional(), // JSON array representation of final image URLs & indices
});
export type EditPostDTO = z.infer<typeof EditPostDTO>;

/**
 * VoteDTO — validates vote request body.
 * type must be either 'upvote' or 'downvote'.
 */
export const VoteDTO = z.object({
    type: z.enum(["upvote", "downvote"], {
        required_error: "Vote type is required",
        invalid_type_error: "Vote type must be 'upvote' or 'downvote'",
    }),
});
export type VoteDTO = z.infer<typeof VoteDTO>;

/**
 * PaginationQueryDTO — typed query params for the feed endpoint.
 */
export const FeedPaginationQueryDTO = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type FeedPaginationQueryDTO = z.infer<typeof FeedPaginationQueryDTO>;
