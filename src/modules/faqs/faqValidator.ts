import { z } from "zod";

export const faqSchema = z.object({
    categoryId: z.string(),
    question: z.string(),
    answer: z.string()
});