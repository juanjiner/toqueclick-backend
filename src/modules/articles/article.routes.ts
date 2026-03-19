import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { ArticleController } from "./article.controller.js";
import { articleSchema } from "./articleValidator.js";

const router = Router();
const controller = new ArticleController();

router.get("/", asyncHandler(controller.getAll));
router.post("/", validate(articleSchema), asyncHandler(controller.create));
router.put("/:id", validate(articleSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;