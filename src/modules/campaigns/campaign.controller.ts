import { Request, Response } from "express";
import { successResponse } from "../../utils/apiResponse.js";
import { CampaignService } from "./campaign.service.js";

export class CampaignController {

    private service = new CampaignService();

    getAll = async (req: Request, res: Response) => {
        const activeOnly = req.query.activeOnly === 'true';
        const campaigns = await this.service.getAllCampaigns(activeOnly);
        res.json(successResponse(campaigns));
    };

    getById = async (req: Request, res: Response) => {
        const campaign = await this.service.getCampaignById(String(req.params.id));
        res.json(successResponse(campaign));
    };

    create = async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[] | undefined;
        if (typeof req.body.banners === 'string') {
            try { req.body.banners = JSON.parse(req.body.banners); } catch (e) { req.body.banners = []; }
        }
        if (typeof req.body.isActive === 'string') {
            req.body.isActive = req.body.isActive === 'true';
        }
        const campaign = await this.service.createCampaign(req.body, files);
        res.status(201).json(successResponse(campaign));
    };

    update = async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[] | undefined;
        if (typeof req.body.banners === 'string') {
            try { req.body.banners = JSON.parse(req.body.banners); } catch (e) { req.body.banners = []; }
        }
        if (typeof req.body.isActive === 'string') {
            req.body.isActive = req.body.isActive === 'true';
        }
        const campaign = await this.service.updateCampaign(String(req.params.id), req.body, files);
        res.json(successResponse(campaign));
    };

    delete = async (req: Request, res: Response) => {
        await this.service.deleteCampaign(String(req.params.id));
        res.json(successResponse(null, "Campaña eliminada correctamente"));
    };
}
