import { z } from "zod";
import { CommentSchema } from "../types/comment.type";

/**
 * CreateCommentDTO — validates incoming comment creation data.
 */
export const CreateCommentDTO = CommentSchema.pick({
    text: true,
});

export type CreateCommentDTO = z.infer<typeof CreateCommentDTO>;
