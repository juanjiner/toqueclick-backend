import { z } from "zod";

export const businessSchema = z.object({
    businessName: z.string(),
    cityId: z.string(),
    categoryId: z.string(),
    description: z.string(),
    address: z.string(),
    phone: z.string(),
    logoUrl: z.string()
});