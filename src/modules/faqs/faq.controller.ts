import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { FaqService } from "./faq.service.js";

export class FaqController {

    private service = new FaqService();

    getAll = async (_req: Request, res: Response) => {
        const faqs = await this.service.getFaqs();
        res.json(successResponse(faqs));
    };

    create = async (req: Request, res: Response) => {
        const faq = await this.service.createFaq(req.body);
        res.status(201).json(successResponse(faq));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const faq = await this.service.updateFaq(id, req.body);

        if (!faq) {
            throw new AppError("Pregunta frecuente no encontrada", 404);
        }

        res.json(successResponse(faq));
    };

    delete = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        await this.service.deleteFaq(id);
        res.status(204).send();
    };
}