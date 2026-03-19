import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { PromotionController } from "./promotion.controller.js";
import { promotionSchema } from "./promotionValidator.js";

const router = Router();
const controller = new PromotionController();

router.get("/", asyncHandler(controller.getAll));
router.post("/", validate(promotionSchema), asyncHandler(controller.create));
router.put("/:id", validate(promotionSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));
router.get("/promo-types", asyncHandler(controller.getPromoTypes));
router.get("/purchase-types", asyncHandler(controller.getPurchaseTypes));

export default router;