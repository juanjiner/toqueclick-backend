import { Request, Response } from "express";
import { successResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/AppError.js";
import { LegalService } from "./legal.service.js";

export class LegalController {

    private service = new LegalService();

    getLegal = async (_req: Request, res: Response) => {
        const legal = await this.service.getLegal();
        res.json(successResponse(legal));
    };

    create = async (req: Request, res: Response) => {
        const legal = await this.service.createLegal(req.body);
        res.status(201).json(successResponse(legal));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const legal = await this.service.updateLegal(id, req.body);

        if (!legal) {
            throw new AppError("Información legal no encontrada", 404);
        }

        res.json(successResponse(legal));
    };
}