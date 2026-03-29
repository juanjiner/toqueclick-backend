import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate, requireRole } from "../../middlewares/auth.middleware.js";
import { UserController } from "./user.controller.js";
import {
    changePasswordSchema,
    completeNewPasswordSchema,
    confirmForgotPasswordSchema,
    createUserSchema,
    forgotPasswordSchema,
    loginSchema,
    refreshTokenSchema,
    updateUserSchema,
} from "./user.validator.js";

const router = Router();
const controller = new UserController();

// Auth (públicas)
router.post("/auth/login", validate(loginSchema), asyncHandler(controller.login));
router.post("/auth/new-password", validate(completeNewPasswordSchema), asyncHandler(controller.completeNewPassword));
router.post("/auth/refresh", validate(refreshTokenSchema), asyncHandler(controller.refreshTokens));
router.post("/auth/forgot-password", validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
router.post("/auth/confirm-forgot-password", validate(confirmForgotPasswordSchema), asyncHandler(controller.confirmForgotPassword));

// Auth (protegidas)
router.post("/auth/change-password", authenticate, validate(changePasswordSchema), asyncHandler(controller.changePassword));
router.post("/auth/logout", authenticate, asyncHandler(controller.logout));

// Usuarios
router.get("/me", authenticate, asyncHandler(controller.getMe));
router.get("/", authenticate, requireRole("Superadmin"), asyncHandler(controller.getAll));
router.post("/", authenticate, requireRole("Superadmin"), validate(createUserSchema), asyncHandler(controller.create));
router.put("/:id", authenticate, requireRole("Superadmin"), validate(updateUserSchema), asyncHandler(controller.update));
router.delete("/:id", authenticate, requireRole("Superadmin"), asyncHandler(controller.delete));

export default router;