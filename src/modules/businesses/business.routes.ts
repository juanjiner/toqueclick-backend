import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { BusinessesController } from "./business.controller.js";
import { businessSchema } from "./businessValidator.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";

const router = Router();
const controller = new BusinessesController();
const upload = uploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.post("/", upload.single("image"), validate(businessSchema), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), validate(businessSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;