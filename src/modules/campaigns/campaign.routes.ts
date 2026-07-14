import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CampaignController } from "./campaign.controller.js";
import { uploadFactory } from "../../middlewares/uploadFactory.js";
import { validate } from "../../middlewares/validate.js";
import { createCampaignSchema, updateCampaignSchema } from "./campaign.validator.js";

const router = Router();
const controller = new CampaignController();
const upload = uploadFactory();

router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", upload.array("images", 20), validate(createCampaignSchema), asyncHandler(controller.create));
router.put("/:id", upload.array("images", 20), validate(updateCampaignSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;
