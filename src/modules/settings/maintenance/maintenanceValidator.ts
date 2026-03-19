import { z } from "zod";

export const maintenanceSchema = z.object({
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string(),
});