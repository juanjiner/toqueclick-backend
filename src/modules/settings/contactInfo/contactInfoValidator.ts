import { z } from "zod";

export const contactInfoSchema = z.object({
    contactEmail: z.string(),
    supportPhone: z.string(),
    supportWhatsapp: z.string(),
    schedule: z.string()
});