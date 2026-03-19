import { z } from "zod";

export const legalSchema = z.object({
    companyName: z.string(),
    ruc: z.string(),
    legalAddress: z.string()
});