import { z } from "zod";

export const subscribeSchema = z.object({
    email: z.string().email("Correo electrónico inválido").trim()
});