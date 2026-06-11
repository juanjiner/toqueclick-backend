import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { PromotionController } from "./promotion.controller.js";
import { promotionSchema } from "./promotionValidator.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";
import { excelUploadFactory } from "../../middlewares/excelUploadFactory.js";

const router = Router();
const controller = new PromotionController();
const upload = uploadFactory();
const excelUpload = excelUploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.get("/export", asyncHandler(controller.exportExcel));
router.get("/template", asyncHandler(controller.downloadTemplate));
router.post("/import", excelUpload.single("file"), asyncHandler(controller.importExcel));

router.post("/", upload.single("image"), validate(promotionSchema), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), validate(promotionSchema), asyncHandler(controller.update));
router.patch('/:id/views', asyncHandler(controller.incrementViews));
router.delete("/:id", asyncHandler(controller.delete));
router.get("/promo-types", asyncHandler(controller.getPromoTypes));
router.get("/purchase-types", asyncHandler(controller.getPurchaseTypes));

export default router;