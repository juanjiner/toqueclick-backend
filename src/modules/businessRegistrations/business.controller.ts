import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { BusinessService } from "./business.service.js";

export class BusinessController {

    private service = new BusinessService();

    getAll = async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20));
        const search = req.query.search ? String(req.query.search).trim() : undefined;
        const offset = (page - 1) * pageSize;

        const { data, total } = await this.service.getBusinesses(pageSize, offset, search);

        res.json(successResponse({
            data,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        }));
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

    exportExcel = async (_req: Request, res: Response) => {
        const buffer = await this.service.exportExcel();
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="solicitudes_afiliacion.xlsx"');
        res.send(buffer);
    };
}