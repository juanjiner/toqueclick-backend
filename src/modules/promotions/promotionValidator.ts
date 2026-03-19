import { z } from "zod";

export const promotionSchema = z.object({
    businessNameId: z.string(),
    cityId: z.string(),
    title: z.string(),
    description: z.string(),
    promoPrice: z.number(),
    originalPrice: z.number(),
    promoTypeId: z.string(),
    purchaseTypeId: z.string(),
    expirationDate: z.string()
});