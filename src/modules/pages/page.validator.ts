import { z } from 'zod';

export const updatePageSchema = z.object({
    published: z.boolean().nullable().optional(),
    category: z.string().nullable().optional(),
});

export const createPageSchema = z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
});

export const upsertSectionSchema = z.object({
    sectionKey: z.string().min(1),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().nullable().optional(),
    ctaText2: z.string().nullable().optional(),
    ctaLink2: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    carouselEnabled: z.coerce.boolean().optional(),
    regulatoryText: z.string().nullable().optional(),
    sortOrder: z.coerce.number().optional(),
    settings: z.any().optional().transform(val => {
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch { return undefined; }
        }
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            return val;
        }
        return undefined;
    }),
});

export const createItemSchema = z.object({
    icon: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().nullable().optional(),
    ctaText2: z.string().nullable().optional(),
    ctaLink2: z.string().nullable().optional(),
    sortOrder: z.coerce.number().nullable().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const reorderItemsSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
    })),
});