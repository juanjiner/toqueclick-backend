import { Router } from "express";
import { AppLinksController } from "./appLinks/appLinks.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { appLinksSchema } from "./appLinks/appLinksValidator.js";
import { ContactInfoController } from "./contactInfo/contactInfo.controller.js";
import { contactInfoSchema } from "./contactInfo/contactInfoValidator.js";
import { SocialController } from "./social/social.controller.js";
import { socialSchema } from "./social/socialValidator.js";
import { LegalController } from "./legal/legal.controller.js";
import { legalSchema } from "./legal/legalValidator.js";
import { MaintenanceController } from "./maintenance/maintenance.controller.js";
import { maintenanceSchema } from "./maintenance/maintenanceValidator.js";
import { BootstrapController } from "./bootstrap/bootstrap.controller.js";

const router = Router();
const controller = new AppLinksController();
const contactInfoController = new ContactInfoController();
const socialController = new SocialController();
const legalController = new LegalController();
const maintenanceController = new MaintenanceController();
const bootstrapController = new BootstrapController();

router.get("/app-links", asyncHandler(controller.getAppLinks));
router.post("/app-links", validate(appLinksSchema), asyncHandler(controller.create));
router.put("/app-links/:id", validate(appLinksSchema), asyncHandler(controller.update));

router.get("/contact", asyncHandler(contactInfoController.getContactInfo));
router.post("/contact", validate(contactInfoSchema), asyncHandler(contactInfoController.create));
router.put("/contact/:id", validate(contactInfoSchema), asyncHandler(contactInfoController.update));

router.get("/social", asyncHandler(socialController.getSocial));
router.post("/social", validate(socialSchema), asyncHandler(socialController.create));
router.put("/social/:id", validate(socialSchema), asyncHandler(socialController.update));

router.get("/legal", asyncHandler(legalController.getLegal));
router.post("/legal", validate(legalSchema), asyncHandler(legalController.create));
router.put("/legal/:id", validate(legalSchema), asyncHandler(legalController.update));

router.get("/maintenance", asyncHandler(maintenanceController.getMaintenance));
router.post("/maintenance", validate(maintenanceSchema), asyncHandler(maintenanceController.create));
router.put("/maintenance/:id", validate(maintenanceSchema), asyncHandler(maintenanceController.update));

router.get("/bootstrap", asyncHandler(bootstrapController.getBootstrap));

export default router;