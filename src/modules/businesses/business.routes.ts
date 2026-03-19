import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { BusinessesController } from "./business.controller.js";
import { businessSchema } from "./businessValidator.js";

const router = Router();
const controller = new BusinessesController();

router.get("/", asyncHandler(controller.getAll));
router.post("/", validate(businessSchema), asyncHandler(controller.create));
router.put("/:id", validate(businessSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;