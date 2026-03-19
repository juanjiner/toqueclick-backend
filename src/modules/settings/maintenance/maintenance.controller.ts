import { Request, Response } from "express";
import { successResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/AppError.js";
import { MaintenanceService } from "./maintenance.service.js";

export class MaintenanceController {

    private service = new MaintenanceService();

    getMaintenance = async (_req: Request, res: Response) => {
        const maintenance = await this.service.getMaintenance();
        res.json(successResponse(maintenance));
    };

    create = async (req: Request, res: Response) => {
        const maintenance = await this.service.createMaintenance(req.body);
        res.status(201).json(successResponse(maintenance));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const maintenance = await this.service.updateMaintenance(id, req.body);

        if (!maintenance) {
            throw new AppError("Mantenimiento no encontrado", 404);
        }

        res.json(successResponse(maintenance));
    };
}