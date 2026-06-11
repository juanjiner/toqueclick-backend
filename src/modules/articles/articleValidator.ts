import { z } from "zod";

export const articleSchema = z.object({
    title: z.string(),
    categoryId: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    content: z.string(),
    tags: z.string().optional(),
    published: z.enum(['true', 'false']).transform((val) => val === 'true'),
    audioUrl: z.string().optional().nullable(),
    videoUrl: z.string().optional().nullable(),
});