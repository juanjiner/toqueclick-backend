import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CategoryController } from "./category.controller.js";

const router = Router();
const controller = new CategoryController();

router.get("/business", asyncHandler(controller.getBusinessCategories));
router.post("/business", asyncHandler(controller.create));
router.get("/blog", asyncHandler(controller.getBlogCategories));
router.get("/faq", asyncHandler(controller.getFaqCategories));

export default router;