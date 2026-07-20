import { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse.js';
import { PopupService } from './popup.service.js';

export class PopupController {
    private service = new PopupService();

    getAllPopups = async (req: Request, res: Response) => {
        const popups = await this.service.getAllPopups();
        res.json(successResponse(popups));
    };

    getPopupById = async (req: Request, res: Response) => {
        const popup = await this.service.getPopupById(String(req.params.id));
        res.json(successResponse(popup));
    };

    getActivePopups = async (req: Request, res: Response) => {
        const pagePath = req.query.page ? String(req.query.page) : '/';
        const popups = await this.service.getActivePopupsForPage(pagePath);
        res.json(successResponse(popups));
    };

    createPopup = async (req: Request, res: Response) => {
        const popup = await this.service.createPopup(req.body);
        res.status(201).json(successResponse(popup));
    };

    updatePopup = async (req: Request, res: Response) => {
        const popup = await this.service.updatePopup(String(req.params.id), req.body);
        res.json(successResponse(popup));
    };

    deletePopup = async (req: Request, res: Response) => {
        await this.service.deletePopup(String(req.params.id));
        res.status(204).send();
    };
}
