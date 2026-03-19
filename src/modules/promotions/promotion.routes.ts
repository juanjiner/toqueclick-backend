import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { PromotionController } from "./promotion.controller.js";
import { promotionSchema } from "./promotionValidator.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";

const router = Router();
const controller = new PromotionController();
const upload = uploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.post("/", upload.single("image"), validate(promotionSchema), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), validate(promotionSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));
router.get("/promo-types", asyncHandler(controller.getPromoTypes));
router.get("/purchase-types", asyncHandler(controller.getPurchaseTypes));

export default router;