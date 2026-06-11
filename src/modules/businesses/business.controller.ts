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
        if (!req.file) throw new AppError("Imagen requerida", 400);
        const business = await this.service.createBusiness(req.body, req.file);
        res.status(201).json(successResponse(business));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const business = await this.service.updateBusiness(id, req.body, req.file);

        if (!business) {
            throw new AppError("Comercio no encontrado", 404);
        }

        res.json(successResponse(business));
    };

    approve = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const business = await this.service.approveBusiness(id);
        if (!business) throw new AppError("Comercio no encontrado", 404);
        res.json(successResponse(business));
    };

    reject = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const business = await this.service.rejectBusiness(id);
        if (!business) throw new AppError("Comercio no encontrado", 404);
        res.json(successResponse(business));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteBusiness(id);
        res.status(204).send();
    };

    exportExcel = async (_req: Request, res: Response) => {
        const buffer = await this.service.exportExcel();
        res.json(successResponse({ fileBase64: buffer.toString('base64') }, "Exportación exitosa"));
    };

    downloadTemplate = async (_req: Request, res: Response) => {
        const buffer = await this.service.generateTemplate();
        res.json(successResponse({ fileBase64: buffer.toString('base64') }, "Plantilla generada"));
    };

    importExcel = async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json(successResponse(null, "No se proporcionó ningún archivo"));
        }
        const count = await this.service.importExcel(req.file);
        res.json(successResponse({ count }, `Se importaron ${count} comercios exitosamente`));
    };
}