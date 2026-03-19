import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { BusinessService } from "./business.service.js";

export class BusinessesController {

    private service = new BusinessService();

    getAll = async (_req: Request, res: Response) => {
        const businesses = await this.service.getBusinesses();
        res.json(successResponse(businesses));
    };

    create = async (req: Request, res: Response) => {
        const business = await this.service.createBusiness(req.body);
        res.status(201).json(successResponse(business));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const business = await this.service.updateBusiness(id, req.body);

        if (!business) {
            throw new AppError("Comercio no encontrado", 404);
        }

        res.json(successResponse(business));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteBusiness(id);
        res.status(204).send();
    };
}