import { Request, Response } from "express";
import { AppLinksService } from "../appLinks/appLinks.service.js";
import { ContactInfoService } from "../contactInfo/contactInfo.service.js";
import { SocialService } from "../social/social.service.js";
import { MaintenanceService } from "../maintenance/maintenance.service.js";
import { successResponse } from "../../../utils/apiResponse.js";

export class BootstrapController {

    private appLinksService = new AppLinksService();
    private contactInfoService = new ContactInfoService();
    private socialService = new SocialService();
    private maintenanceService = new MaintenanceService();

    getBootstrap = async (_req: Request, res: Response) => {
        const [maintenanceResult, appLinksResult, socialResult, contactResult] =
            await Promise.allSettled([
                this.maintenanceService.getMaintenance(),
                this.appLinksService.getAppLinks(),
                this.socialService.getSocial(),
                this.contactInfoService.getContactInfo(),
            ]);

        const data = {
            maintenance: maintenanceResult.status === "fulfilled"
                ? maintenanceResult.value
                : null,
            appLinks: appLinksResult.status === "fulfilled"
                ? appLinksResult.value
                : null,
            social: socialResult.status === "fulfilled"
                ? socialResult.value
                : null,
            contact: contactResult.status === "fulfilled"
                ? contactResult.value
                : null,
        };

        // Cache CDN/navegador: 60s fresh, 5min stale-while-revalidate
        res.setHeader(
            "Cache-Control",
            "public, max-age=60, stale-while-revalidate=300"
        );

        res.json(successResponse(data));
    };
}
