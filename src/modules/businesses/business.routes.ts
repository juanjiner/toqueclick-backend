import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { BusinessesController } from "./business.controller.js";
import { businessSchema } from "./businessValidator.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";
import { excelUploadFactory } from "../../middlewares/excelUploadFactory.js";

const router = Router();
const controller = new BusinessesController();
const upload = uploadFactory();
const excelUpload = excelUploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.get("/export", asyncHandler(controller.exportExcel));
router.get("/template", asyncHandler(controller.downloadTemplate));
router.post("/import", excelUpload.single("file"), asyncHandler(controller.importExcel));
router.post("/", upload.single("image"), validate(businessSchema), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), validate(businessSchema), asyncHandler(controller.update));
router.patch("/:id/approve", asyncHandler(controller.approve));
router.patch("/:id/reject", asyncHandler(controller.reject));
router.delete("/:id", asyncHandler(controller.delete));

export default router;