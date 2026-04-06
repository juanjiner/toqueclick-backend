import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { BusinessService } from "./business.service.js";

export class BusinessController {

    private service = new BusinessService();

    getAll = async (_req: Request, res: Response) => {
        const businesses = await this.service.getBusinesses();
        res.json(successResponse(businesses));
    };

    getById = async (req: Request, res: Response) => {
        const business = await this.service.getById(String(req.params.id));
        if (!business) throw new AppError("Negocio no encontrado", 404);
        res.json(successResponse(business));
    };

    getPending = async (_req: Request, res: Response) => {
        const data = await this.service.getPendingBusinesses();
        res.json(successResponse(data));
    };

    create = async (req: Request, res: Response) => {
        const data = await this.service.createBusiness(req.body);
        res.status(201).json(successResponse(data));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const data = await this.service.updateBusiness(id, req.body);
        if (!data) throw new AppError("Negocio no encontrado", 404);
        res.json(successResponse(data));
    };

    updateStatus = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const { status } = req.body;
        const data = await this.service.updateStatus(id, status);
        if (!data) throw new AppError("Negocio no encontrado", 404);
        res.json(successResponse(data));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteBusiness(id);
        res.status(204).send();
    };
}