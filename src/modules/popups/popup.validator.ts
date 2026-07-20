import { z } from 'zod';

const basePopupSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio').max(70, 'El título no puede exceder los 70 caracteres'),
    description: z.string().max(250, 'La descripción no puede exceder los 250 caracteres').nullable().optional(),
    icon: z.enum(['INFO', 'WARNING', 'GIFT', 'MEGAPHONE']),
    position: z.enum(['CENTER', 'BOTTOM_RIGHT']),
    ctaText: z.string().max(30).nullable().optional(),
    ctaLink: z.string().max(255).nullable().optional(),
    isActive: z.boolean().optional(),
    startDate: z.union([z.string(), z.date()]).nullable().optional(),
    endDate: z.union([z.string(), z.date()]).nullable().optional(),
    displayRules: z.any().optional().transform(val => {
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch { return undefined; }
        }
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            return val;
        }
        return undefined;
    }),
});

const refineValidation = (data: any, ctx: z.RefinementCtx) => {
    if ((data.ctaText && !data.ctaLink) || (!data.ctaText && data.ctaLink)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El texto y el enlace del botón deben ir juntos",
            path: ["ctaText"]
        });
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El texto y el enlace del botón deben ir juntos",
            path: ["ctaLink"]
        });
    }

    if ((data.startDate && !data.endDate) || (!data.startDate && data.endDate)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ambas fechas son obligatorias si se define un rango",
            path: ["startDate"]
        });
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ambas fechas son obligatorias si se define un rango",
            path: ["endDate"]
        });
    }

    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La fecha de fin debe ser posterior a la de inicio",
                path: ["endDate"]
            });
        }
    }

    if (data.displayRules && data.displayRules.targetPages) {
        if (!Array.isArray(data.displayRules.targetPages) || data.displayRules.targetPages.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe asignar al menos una página de destino",
                path: ["displayRules", "targetPages"]
            });
        }
    }
};

export const createPopupSchema = basePopupSchema.superRefine(refineValidation);
export const updatePopupSchema = basePopupSchema.partial().superRefine(refineValidation);
