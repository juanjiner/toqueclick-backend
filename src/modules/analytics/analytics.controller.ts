import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AnalyticsService } from "./analytics.service.js";

export class AnalyticsController {
    private service = new AnalyticsService();

    track = async (req: Request, res: Response) => {
        const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "";
        const userAgent = req.headers["user-agent"] || "";

        const eventData = {
            ...req.body,
            ipAddress: ipAddress.split(",")[0].trim(), // en caso de proxies, tomar la IP real
            userAgent
        };

        const result = await this.service.trackEvent(eventData);
        res.status(201).json(successResponse(result));
    };

    getMarketingSettings = async (_req: Request, res: Response) => {
        const settings = await this.service.getMarketingSettings();
        res.json(successResponse(settings));
    };

    updateMarketingSettings = async (req: Request, res: Response) => {
        const settings = await this.service.updateMarketingSettings(req.body);
        res.json(successResponse(settings));
    };
}
