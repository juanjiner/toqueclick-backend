import { Request, Response } from "express";
import { successResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/AppError.js";
import { ContactInfoService } from "./contactInfo.service.js";

export class ContactInfoController {

    private service = new ContactInfoService();

    getContactInfo = async (_req: Request, res: Response) => {
        const contactInfo = await this.service.getContactInfo();
        res.json(successResponse(contactInfo));
    };

    create = async (req: Request, res: Response) => {
        const contactInfo = await this.service.createContactInfo(req.body);
        res.status(201).json(successResponse(contactInfo));
    };

    update = async (req: Request, res: Response) => {
        const id = String(req.params.id);
        const contactInfo = await this.service.updateContactInfo(id, req.body);

        if (!contactInfo) {
            throw new AppError("Información de contacto no encontrada", 404);
        }

        res.json(successResponse(contactInfo));
    };
}