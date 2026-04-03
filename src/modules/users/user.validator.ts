import { z } from "zod";

export const createUserSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    rol: z.enum(["Superadmin", "Editor"]),
    temporaryPassword: z.string().min(12),
});

export const updateUserSchema = z.object({
    fullName: z.string().min(1).optional(),
    rol: z.enum(["Superadmin", "Editor"]).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const completeNewPasswordSchema = z.object({
    email: z.string().email(),
    newPassword: z.string().min(12),
    session: z.string().min(1),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
    previousPassword: z.string().min(1),
    proposedPassword: z.string().min(12),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const confirmForgotPasswordSchema = z.object({
    email: z.string().email(),
    confirmationCode: z.string().min(1),
    newPassword: z.string().min(12),
});