import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CampaignController } from "./campaign.controller.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";

const router = Router();
const controller = new CampaignController();
const upload = uploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", upload.single("image"), asyncHandler(controller.create));
router.put("/:id", upload.single("image"), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;
