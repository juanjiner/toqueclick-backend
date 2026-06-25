import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AnalyticsController } from "./analytics.controller.js";

const router = Router();
const controller = new AnalyticsController();

router.post("/track", asyncHandler(controller.track));
router.get("/marketing-settings", asyncHandler(controller.getMarketingSettings));
router.put("/marketing-settings", asyncHandler(controller.updateMarketingSettings));
router.get("/geo-heatmap", asyncHandler(controller.getGeoHeatmap));

export default router;
