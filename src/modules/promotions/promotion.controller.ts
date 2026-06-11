import { Request, Response } from "express";
import { PromotionService } from "./promotion.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";

export class PromotionController {

    private service = new PromotionService();

    getAll = async (_req: Request, res: Response) => {
        const promotions = await this.service.getPromotions();
        res.json(successResponse(promotions));
    };

    create = async (req: Request, res: Response) => {
        if (!req.file) throw new AppError("Imagen requerida", 400);
        const promotion = await this.service.createPromotion(req.body, req.file);
        res.status(201).json(successResponse(promotion));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const promotion = await this.service.updatePromotion(id, req.body, req.file);

        if (!promotion) {
            throw new AppError("Promoción no encontrada", 404);
        }

        res.json(successResponse(promotion));
    };

    incrementViews = async (req: Request, res: Response) => {
        await this.service.incrementViews(String(req.params.id));
        res.status(204).send();
    }

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deletePromotion(id);
        res.status(204).send();
    };

    getPromoTypes = async (_req: Request, res: Response) => {
        const promoTypes = await this.service.getPromoTypes();
        res.json(successResponse(promoTypes));
    };

    getPurchaseTypes = async (_req: Request, res: Response) => {
        const purchaseTypes = await this.service.getPurchaseTypes();
        res.json(successResponse(purchaseTypes));
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
        if (!req.file) throw new AppError("Archivo Excel requerido", 400);
        const count = await this.service.importExcel(req.file);
        res.json(successResponse({ count }));
    };
}