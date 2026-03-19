import { z } from "zod";

export const appLinksSchema = z.object({
    appStoreUrl: z.string(),
    googlePlayUrl: z.string()
});