import { Request, Response } from "express";
import { AppLinksService } from "./appLinks.service.js";
import { successResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/AppError.js";

export class AppLinksController {

    private service = new AppLinksService();

    getAppLinks = async (_req: Request, res: Response) => {
        const appLinks = await this.service.getAppLinks();
        res.json(successResponse(appLinks));
    };

    create = async (req: Request, res: Response) => {
        const appLinks = await this.service.createAppLinks(req.body);
        res.status(201).json(successResponse(appLinks));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const appLinks = await this.service.updateAppLinks(id, req.body);

        if (!appLinks) {
            throw new AppError("Links de descarga no encontrado", 404);
        }

        res.json(successResponse(appLinks));
    };
}