import { z } from "zod";

export const articleSchema = z.object({
    title: z.string(),
    imageUrl: z.string(),
    categoryId: z.string(),
    author: z.string(),
    content: z.string()
});