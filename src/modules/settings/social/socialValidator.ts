import { z } from "zod";

export const socialSchema = z.object({
    facebookUrl: z.string(),
    instagramUrl: z.string(),
    twitterUrl: z.string(),
    linkedinUrl: z.string()
});