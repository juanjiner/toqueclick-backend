import { z } from "zod";

const booleanField = z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .or(z.boolean());

export const businessSchema = z.object({
    // Step 1
    legalName: z.string().min(1),
    tradeName: z.string().min(1),
    ruc: z.string().length(11).regex(/^\d{11}$/),
    categoryId: z.string().uuid(),
    departmentId: z.string().uuid(),
    provinceId: z.string().uuid(),
    districtId: z.string().uuid(),

    // Step 2
    contactName: z.string().min(1),
    contactPosition: z.string().min(1),
    phone: z.string().length(9).regex(/^\d{9}$/),
    email: z.string().email(),

    // Step 3
    benefitPercentageDiscounts: booleanField.default(false),
    benefit2x1Promotions: booleanField.default(false),
    benefitFreeProducts: booleanField.default(false),
    benefitLoyaltyPoints: booleanField.default(false),
    benefitExclusiveOffers: booleanField.default(false),
    additionalComments: z.string().optional(),

    // Step 4
    termsAccepted: booleanField.refine((val) => val === true, {
        message: "Debes aceptar los términos y condiciones",
    }),
});

export const updateStatusSchema = z.object({
    status: z.enum(["draft", "submitted", "approved", "rejected"]),
});