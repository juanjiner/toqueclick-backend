import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { FaqController } from "./faq.controller.js";
import { faqSchema } from "./faqValidator.js";

const router = Router();
const controller = new FaqController();

router.get("/", asyncHandler(controller.getAll));
router.post("/", validate(faqSchema), asyncHandler(controller.create));
router.put("/:id", validate(faqSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;