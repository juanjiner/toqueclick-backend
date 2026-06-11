import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CategoryController } from "./category.controller.js";

const router = Router();
const controller = new CategoryController();

router.get("/business", asyncHandler(controller.getBusinessCategories));
router.get("/blog", asyncHandler(controller.getBlogCategories));
router.get("/faq", asyncHandler(controller.getFaqCategories));
router.get("/product", asyncHandler(controller.getProductCategories));

export default router;