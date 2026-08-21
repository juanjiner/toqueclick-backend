import { Router } from "express";
import { LeadController } from "./lead.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new LeadController();

router.post("/", controller.createLead);
router.get("/", authenticate, controller.getAllLeads);

export default router;
