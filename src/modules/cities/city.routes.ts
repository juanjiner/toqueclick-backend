import { Router } from "express";
import { DepartamentController } from "./city.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
const controller = new DepartamentController();

router.get("/departaments", asyncHandler(controller.getDepartaments));
router.get("/departament/:departament/provinces", asyncHandler(controller.getProvinces));
router.get("/province/:province/districts", asyncHandler(controller.getDistricts));

export default router;