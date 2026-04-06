import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { ArticleController } from "./article.controller.js";
import { articleSchema } from "./articleValidator.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";

const router = Router();
const controller = new ArticleController();
const upload = uploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.post("/", upload.single("image"), validate(articleSchema), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), validate(articleSchema), asyncHandler(controller.update));
router.get("/:id", asyncHandler(controller.getById));
router.delete("/:id", asyncHandler(controller.delete));

export default router;