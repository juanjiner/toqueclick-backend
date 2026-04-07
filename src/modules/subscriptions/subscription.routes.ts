import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { SubscriptionController } from "./subscription.controller.js";
import { subscribeSchema } from "./subscription.validator.js";

const router = Router();
const controller = new SubscriptionController();

router.post("/", validate(subscribeSchema), asyncHandler(controller.subscribe));
router.delete("/unsubscribe", validate(subscribeSchema), asyncHandler(controller.unsubscribe));

export default router;