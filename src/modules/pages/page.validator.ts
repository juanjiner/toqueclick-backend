import { z } from 'zod';

export const updatePageSchema = z.object({
    published: z.boolean().nullable().optional(),
});

export const upsertSectionSchema = z.object({
    sectionKey: z.string().min(1),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    sortOrder: z.number().optional(),
});

export const createItemSchema = z.object({
    icon: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().nullable().optional(),
    sortOrder: z.number().nullable().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const reorderItemsSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
    })),
});