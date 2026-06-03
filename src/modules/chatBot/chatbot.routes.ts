import { Router } from "express";
import { ChatbotController } from "./chatbot.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
const controller = new ChatbotController();

router.get("/faqs", asyncHandler(controller.getFaqs));
router.post("/message", asyncHandler(controller.sendMessage));

export default router;