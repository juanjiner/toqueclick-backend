import { Router } from "express";
import { getDashboard, getExecutiveDashboard } from "./dashboard.controller.js";

const router = Router();

router.get("/", getDashboard);
router.get("/executive", getExecutiveDashboard);

export default router;