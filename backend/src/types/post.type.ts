import { z } from "zod";

export const MapDataSchema = z.object({
    type: z.literal("Point").optional(),
    coordinates: z.array(z.number()).length(2), // [longitude, latitude]
    placeName: z.string().optional(),
}).optional();

export const PostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
    subtitle: z.string().max(300, "Subtitle must be under 300 characters").optional(),
    description: z.string().min(1, "Description is required").max(5000, "Description must be under 5000 characters"),
    imageUrls: z.array(z.string()).optional().default([]),
    links: z.array(z.string().url("Each link must be a valid URL")).optional().default([]),
    mapData: MapDataSchema,
    isEdited: z.boolean().optional().default(false),
});

export type PostType = z.infer<typeof PostSchema>;
