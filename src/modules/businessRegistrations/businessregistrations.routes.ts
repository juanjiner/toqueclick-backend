import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { BusinessController } from "./business.controller.js";
import { businessSchema, updateStatusSchema } from "./business.validator.js";

const router = Router();
const controller = new BusinessController();

router.get("/", asyncHandler(controller.getAll));
router.get("/pending", asyncHandler(controller.getPending));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", validate(businessSchema), asyncHandler(controller.create));
router.put("/:id", validate(businessSchema), asyncHandler(controller.update));
router.patch("/:id/status", validate(updateStatusSchema), asyncHandler(controller.updateStatus));
router.delete("/:id", asyncHandler(controller.delete));

export default router;