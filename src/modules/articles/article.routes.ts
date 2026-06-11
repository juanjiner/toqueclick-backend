import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { ArticleController } from "./article.controller.js";
import { articleSchema } from "./articleValidator.js";
import { uploadBlogMediaFactory } from "../../middlewares/uploadFactory.js";
import { ArticleCommentController } from "./articleComment.controller.js";

const router = Router();
const controller = new ArticleController();
const commentController = new ArticleCommentController();
const upload = uploadBlogMediaFactory();
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

router.get("/", asyncHandler(controller.getAll));
router.post("/", uploadFields, validate(articleSchema), asyncHandler(controller.create));
// Comment routes (Static routes must go before /:id)
router.get("/comments", asyncHandler(commentController.getAll));
router.get("/comments/pending", asyncHandler(commentController.getPending));
router.put("/comments/:commentId/status", asyncHandler(commentController.updateStatus));

// Article parameterized routes
router.put("/:id", uploadFields, validate(articleSchema), asyncHandler(controller.update));
router.get("/:id", asyncHandler(controller.getById));
router.delete("/:id", asyncHandler(controller.delete));
router.post("/:id/comments", asyncHandler(commentController.create));
router.get("/:id/comments", asyncHandler(commentController.getByArticle));

export default router;