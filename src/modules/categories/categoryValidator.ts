import { z } from "zod";

export const businessCategorySchema = z.object({
    id: z.string(),
    businessCategory: z.string()
});

export const blogCategorySchema = z.object({
    id: z.string(),
    blogCategory: z.string()
});

export const faqCategorySchema = z.object({
    id: z.string(),
    faqCategory: z.string()
});