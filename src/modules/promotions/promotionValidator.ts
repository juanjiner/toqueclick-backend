import { z } from "zod";

export const promotionSchema = z.object({
    businessNameId: z.string(),
    cityId: z.string(),
    title: z.string(),
    description: z.string(),
    promoPrice: z.coerce.number(),
    originalPrice: z.coerce.number(),
    promoTypeId: z.string(),
    purchaseTypeId: z.string(),
    startDate: z.string(),
    expirationDate: z.string(),
    campaignId: z.string().optional(),
    productCategoryId: z.string().optional(),
    ctaText: z.string().optional(),
    ctaUrl: z.string().optional()
});