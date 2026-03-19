import { Request, Response } from "express";
import { successResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/AppError.js";
import { SocialService } from "./social.service.js";

export class SocialController {

    private service = new SocialService();

    getSocial = async (_req: Request, res: Response) => {
        const networks = await this.service.getSocial();
        res.json(successResponse(networks));
    };

    create = async (req: Request, res: Response) => {
        const social = await this.service.createSocial(req.body);
        res.status(201).json(successResponse(social));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const social = await this.service.updateSocial(id, req.body);

        if (!social) {
            throw new AppError("Red social no encontrada", 404);
        }

        res.json(successResponse(social));
    };
}