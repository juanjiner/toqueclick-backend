import { z } from "zod";

export const createUserSchema = z.object({
    fullName: z.string().min(1),
    email: z.string(),
    rol: z.enum(["Superadmin", "Editor"]),
    temporaryPassword: z.string().min(12),
});

export const updateUserSchema = z.object({
    fullName: z.string().min(1).optional(),
    rol: z.enum(["Superadmin", "Editor"]).optional(),
});

export const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(1),
});

export const completeNewPasswordSchema = z.object({
    email: z.string(),
    newPassword: z.string().min(12),
    session: z.string().min(1),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
    previousPassword: z.string().min(12),
    proposedPassword: z.string().min(12),
});

export const forgotPasswordSchema = z.object({
    email: z.string(),
});

export const confirmForgotPasswordSchema = z.object({
    email: z.string(),
    confirmationCode: z.string().min(1),
    newPassword: z.string().min(12),
});