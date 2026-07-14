import { z } from 'zod';

const campaignBannerSchema = z.object({
    id: z.string().optional(),
    campaignId: z.string().optional(),
    businessId: z.string().nullable().optional(),
    imageUrl: z.string().optional(), // Puede venir vacío si se va a subir una nueva imagen y luego se reemplaza
    title: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    isActive: z.boolean().optional().or(z.string().transform(val => val === 'true')),
});

export const createCampaignSchema = z.object({
    name: z.string().min(1, "El nombre de la campaña es requerido").max(255),
    isActive: z.any().optional().transform(val => {
        if (typeof val === 'string') return val === 'true';
        return Boolean(val);
    }),
    startDate: z.string().nullable().optional(),
    expirationDate: z.string().nullable().optional(),
    status: z.string().optional(),
    banners: z.any().optional().transform(val => {
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                return z.array(campaignBannerSchema).parse(parsed);
            } catch {
                return [];
            }
        }
        if (Array.isArray(val)) {
            return z.array(campaignBannerSchema).parse(val);
        }
        return [];
    }),
});

export const updateCampaignSchema = createCampaignSchema.partial();
